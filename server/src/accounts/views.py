"""Handles all account based requests"""

from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from pytz import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from django.contrib.auth.models import User

from .models import User, HallOfFame, EmployeeAttendance, LeaveApplication


IST = timezone("Asia/Kolkata")


class UpdateHallOfFameView(APIView):
    """API View for users to interact with hall of fame"""

    @staticmethod
    def post(request):
        """POST Request"""
        _check_admin(request)
        try:
            employee_email = request.data["employee"]
            month = request.data["month"]
            year = request.data["year"]
        except KeyError as exception:
            return Response(
                {"message": f"Key {str(exception)} not provided"}, status=403
            )

        if (
            datetime(year, month, 1) - timedelta(days=1) + relativedelta(months=1)
            >= datetime.today()
        ):
            return Response(
                {"message": "Invalid date - month hasn't finished"}, status=403
            )

        if HallOfFame.objects.filter(month=month, year=year).exists():
            return Response(
                {"message": "Hall of fame entry already exists"}, status=403
            )

        if not User.objects.filter(email=employee_email).exists():
            return Response({"message": "Employee does not exist"}, status=403)

        employee = User.objects.get(email=employee_email)
        HallOfFame.objects.create(employee=employee, month=month, year=year)

        return Response({"message": "The Hall Of Fame Has been updated"})


class SeeHallOfFameView(APIView):
    @staticmethod
    def post(request):
        """POST Request"""
        try:
            month = request.data["month"]
            year = request.data["year"]
        except KeyError as exception:
            return Response(
                {"message": f"Key {str(exception)} not provided"}, status=403
            )

        if not HallOfFame.objects.filter(month=month, year=year).exists():
            return Response({"message": "No hall of fame record found"}, status=403)

        employee = HallOfFame.objects.get(month=month, year=year).employee
        employee = {key: employee.__dict__[key] for key in ["first_name", "last_name"]}
        return Response(employee)


class MarkAttendanceView(APIView):
    """API View for users to interact with attendance"""

    CHOICES = [i[1] for i in EmployeeAttendance.STATUS]

    def post(self, request):
        _check_admin(request)
        try:
            attendance = request.data["attendance"]
            attendance_date = datetime.strptime(
                request.data["attendanceDate"], "%Y-%m-%d"
            ).replace(tzinfo=IST)
        except KeyError as exception:
            return Response(
                {"message": f"Key {str(exception)} not provided"}, status=403
            )

        today = datetime.today()
        max_date = datetime(today.year, today.month, today.day, 23, 59).replace(
            tzinfo=IST
        )

        if attendance_date > max_date:
            return Response({"message": "Invalid date"}, status=403)

        employees = User.objects.filter(is_admin=False, is_staff=False).all()
        if EmployeeAttendance.objects.filter(date=attendance_date).exists():
            return Response({"message": "Attendance already marked"}, status=403)

        for employee in employees:
            employee = str(employee)
            if employee not in attendance:
                return Response(
                    {"message": "Employee {employee} not in attendance"}, status=403
                )

            if attendance[employee] not in self.CHOICES:
                return Response({"message": "Invalid status"}, status=403)

        for employee in employees:
            EmployeeAttendance.objects.create(
                employee=employee,
                date=attendance_date,
                status=self.CHOICES.index(attendance[str(employee)]),
            )

        return Response({"message": "Attendance successfully saved"})

    def patch(self, request):
        _check_admin(request)
        try:
            attendance = request.data["attendance"]
            attendance_date = datetime.strptime(
                request.data["attendanceDate"], "%d-%m-%Y"
            ).replace(tzinfo=IST)
        except KeyError as exception:
            raise ValidationError from exception

        users = {}

        for email, status in attendance.items():
            if not User.objects.filter(email=email).exists():
                raise ValidationError

            user = User.objects.get(email=email)
            users[email] = user

            if not EmployeeAttendance.objects.filter(
                employee=user, date=attendance_date
            ).exists():
                raise ValidationError

            if attendance[email] not in self.CHOICES:
                raise ValidationError

        for email, status in attendance.items():
            hof_obj = EmployeeAttendance.objects.get(
                employee=users[email], date=attendance_date
            )
            hof_obj.status = self.CHOICES.index(status)
            hof_obj.save()

        return Response({"message": "Attendance successfully saved"})


class SeeAttendanceView(APIView):
    CHOICES = [i[1] for i in EmployeeAttendance.STATUS]

    def post(self, request):
        try:
            from_date = datetime.strptime(
                request.data["fromDate"][:10], "%Y-%m-%d"
            ).replace(tzinfo=IST)

            to_date = datetime.strptime(
                request.data["toDate"][:10], "%Y-%m-%d"
            ).replace(tzinfo=IST)
        except KeyError as exception:
            return Response(
                {"message": f"Key {str(exception)} not provided"}, status=403
            )

        employee = _get_employee(request)
        if not type(employee) == list:
            data, percent, leaves = _calculate_attendance_stats(
                employee, from_date, to_date, self.CHOICES
            )

            return Response(
                {
                    "attendance": data,
                    "stats": {"presentPercent": percent},
                    "name": f"{employee.first_name} {employee.last_name}",
                    "leaves": f"{leaves} Leaves",
                }
            )

        response = {}
        employees = User.objects.filter(email__in=employee).all()
        for employee in employees.iterator():
            data, percent, leaves = _calculate_attendance_stats(
                employee, from_date, to_date, self.CHOICES
            )
            response[employee.email] = {
                "attendance": data,
                "stats": {"presentPercent": percent},
                "name": f"{employee.first_name} {employee.last_name}",
                "leaves": f"{leaves} Leaves",
            }

        emails = list(response)
        leaves = [int(i["leaves"].replace(" Leaves", "")) for i in response.values()]
        leaves = dict(zip(emails, leaves))
        resp = sorted(leaves.items(), key=lambda x: x[1], reverse=True)
        resp = {email: response[email] for email, _ in resp}

        return Response(resp)


class LeaveApplicationView(APIView):
    """API View for users to interact with hall of view"""

    DECISIONS = [i[1] for i in LeaveApplication.DECISION]

    def get(self, request):
        _check_admin(request)
        applications = LeaveApplication.objects.filter(decision=1).all()
        employee_dict = {}

        response = []
        for app in applications.values():
            employee_id = str(app["employee_id"])
            if employee_id not in employee_dict:
                employee_dict[employee_id] = User.objects.get(id=employee_id)

            if not app["decision_date"]:
                decision_date = "Not decided yet"
            else:
                decision_date = app["decision_date"].strftime("%d/%m/%Y")

            user = employee_dict[employee_id]
            response.append(
                {
                    "id": app["id"],
                    "employeeName": f"{user.first_name} {user.last_name}",
                    "createdAt": app["created_at"].strftime("%d/%m/%Y"),
                    "startDate": app["start_date"].strftime("%d/%m/%Y"),
                    "endDate": app["start_date"].strftime("%d/%m/%Y"),
                    "reason": app["reason"],
                    "decision": self.DECISIONS[app["decision"]],
                    "decisionDate": decision_date,
                }
            )

        return Response(response)

    def post(self, request):
        """POST Request"""
        if _check_admin(request, raise_error=False):
            return Response({"message": "Admins cannot apply for leaves"}, status=403)

        try:
            try:
                start_date = datetime.strptime(
                    request.data["startDate"], "%Y-%m-%d"
                ).replace(tzinfo=IST)
                end_date = datetime.strptime(
                    request.data["endDate"], "%Y-%m-%d"
                ).replace(tzinfo=IST)
            except ValueError:
                return Response(
                    {"message": "Date format is invalid. Please use YYYY-MM-DD"},
                    status=400,
                )
            reason = request.data["reason"]

        except KeyError as exception:
            return Response(
                {"message": f"Key {str(exception)} not provided"}, status=403
            )

        if end_date < start_date:
            return Response(
                {"message": "The end date cannot be less than the start date"},
                status=400,
            )

        if start_date < (datetime.today() + timedelta(days=2)).replace(tzinfo=IST):
            return Response(
                {"message": "You need to inform for a leave 2 days in advance"},
                status=400,
            )

        if len(reason) > 512:
            raise ValidationError

        overlapping_resp = Response(
            {
                "message": "You have an pending or approved leave application"
                " that has overlapping dates"
            },
            status=400,
        )

        if LeaveApplication.objects.filter(
            employee=request.user,
            start_date__lte=start_date,
            end_date__gte=start_date,
        ).exists():
            return overlapping_resp

        if LeaveApplication.objects.filter(
            employee=request.user,
            start_date__lte=end_date,
            end_date__gte=end_date,
        ).exists():
            return overlapping_resp

        LeaveApplication.objects.create(
            employee=request.user,
            start_date=start_date,
            end_date=end_date,
            reason=reason,
            decision=1,
        )
        return Response({"message": "Successfully applied for leave"})

    def patch(self, request):
        _check_admin(request)

        try:
            application_id = request.data["applicationId"]
            decision = request.data["decision"]
        except KeyError as exception:
            return Response(
                {"message": f"Key {str(exception)} not provided"}, status=403
            )

        if decision not in self.DECISIONS:
            raise ValidationError

        if not LeaveApplication.objects.filter(id=application_id).exists():
            raise ValidationError

        application_obj = LeaveApplication.objects.get(id=application_id)
        application_obj.decision_date = datetime.today().replace(tzinfo=IST)
        application_obj.decision = self.DECISIONS.index(decision)
        application_obj.save()

        return Response({"message": "Successfully updated"})


class SeeLeaveApplicationView(APIView):
    DECISIONS = [i[1] for i in LeaveApplication.DECISION]

    def post(self, request):
        admin = _check_admin(request, raise_error=False)
        try:
            current = request.data["current"]
            get_all = request.data["getAll"]
        except KeyError as exception:
            return Response(
                {"message": f"Key {str(exception)} not provided"}, status=403
            )

        if not admin:
            if get_all:
                applications = LeaveApplication.objects.filter(
                    employee=request.user
                ).all()

            elif current:
                applications = LeaveApplication.objects.filter(
                    employee=request.user, decision=1
                ).all()

            else:
                applications = LeaveApplication.objects.filter(
                    employee=request.user, decision__in=[0, 2]
                ).all()

        else:
            try:
                employee = request.data["employee"]
            except KeyError as exception:
                return Response(
                    {"message": f"Key {str(exception)} not provided"}, status=403
                )

            if not User.objects.filter(email=employee).exists():
                raise ValidationError

            employee = User.objects.get(email=employee)

            if current:
                applications = LeaveApplication.objects.filter(
                    decision=1, employee=employee.id
                ).all()

            else:
                applications = LeaveApplication.objects.filter(
                    decision__in=[0, 2], employee=employee.id
                ).all()

        applications = applications.order_by("-created_at")
        data = []

        for app in applications.values():
            user = User.objects.get(id=app["employee_id"])
            if not app["decision_date"]:
                decision_date = "Not decided yet"
            else:
                decision_date = app["decision_date"].strftime("%d/%m/%Y")

            data.append(
                {
                    "id": app["id"],
                    "employeeName": f"{user.first_name} {user.last_name}",
                    "createdAt": app["created_at"].strftime("%d/%m/%Y"),
                    "startDate": app["start_date"].strftime("%d/%m/%Y"),
                    "endDate": app["start_date"].strftime("%d/%m/%Y"),
                    "reason": app["reason"],
                    "decision": self.DECISIONS[app["decision"]].capitalize(),
                    "decisionDate": decision_date,
                }
            )

        return Response(data)


class Employees(APIView):
    def get(self, request):
        employees = User.objects.filter(
            is_staff=False, is_admin=False, is_superuser=False
        ).all()
        data = []

        for employee in employees.values():
            data.append(
                {
                    "name": f"{employee['first_name']} {employee['last_name']}",
                    "email": employee["email"],
                }
            )

        return Response(data)


def _calculate_attendance_stats(employee, from_date, to_date, CHOICES):
    attendance = (
        EmployeeAttendance.objects.filter(
            employee=employee, date__gte=from_date, date__lte=to_date
        )
        .order_by("date")
        .values()
    )

    data = {}
    total = 0
    present = 0

    for i in attendance:
        status = i["status"]
        date = datetime.strftime(i["date"], "%d-%m-%Y")
        data[date] = CHOICES[status]

        if status != 1:
            total += 1

        if status == 2:
            present += 1

    leaves_objects = LeaveApplication.objects.filter(
        employee=employee,
        start_date__gte=from_date,
        end_date__lte=to_date,
        decision=2,
    ).all()
    leaves = 0

    for leave in leaves_objects.iterator():
        for i in range((leave.end_date - leave.start_date).days + 1):
            date = leave.start_date + timedelta(days=i)
            if date.weekday() > 4:
                continue
            leaves += 1

    percent = "N/A"
    if total:
        percent = f"{int(100 * round(present / total, 4))}%"

    return data, percent, leaves


def _get_employee(request):
    if _check_admin(request, raise_error=False):
        try:
            employee_email = request.data["employee"]
        except KeyError as exception:
            raise ValidationError from exception

    else:
        employee_email = request.user.email

    if not type(employee_email) == list:
        if not User.objects.filter(email=employee_email).exists():
            raise ValidationError

        user = User.objects.get(email=employee_email)
        return user

    return employee_email


def _check_admin(request, raise_error=True):
    admin = request.user.is_admin or request.user.is_staff
    if not admin and raise_error:
        raise AuthenticationFailed

    return admin


METHODS_BY_PATHS = {
    "leave-application": LeaveApplicationView.as_view(),
    "see-leave-application": SeeLeaveApplicationView.as_view(),
    "update-hall-of-fame": UpdateHallOfFameView.as_view(),
    "see-hall-of-fame": SeeHallOfFameView.as_view(),
    "mark-attendance": MarkAttendanceView.as_view(),
    "see-attendance": SeeAttendanceView.as_view(),
    "employees": Employees.as_view(),
}
