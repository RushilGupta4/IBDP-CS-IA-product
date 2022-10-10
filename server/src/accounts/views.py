"""Handles all account based requests"""

from datetime import datetime, timedelta

from pytz import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from django.contrib.auth.models import User

from .models import User, HallOfFame, EmployeeAttendance, LeaveApplication


IST = timezone("Asia/Kolkata")


class HallOfFameView(APIView):
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
            raise ValidationError from exception

        if datetime(year, month + 1, 1) - timedelta(days=1) >= datetime.today():
            raise ValidationError

        if HallOfFame.objects.filter(month=month, year=year).exists():
            raise ValidationError

        if not User.objects.filter(email=employee_email).exists():
            raise ValidationError

        employee = User.objects.get(email=employee_email)
        HallOfFame.objects.create(
            employee=employee,
            month=month,
            year=year
        )

        return Response({"message": "The Hall Of Fame Has been updated"})

    @staticmethod
    def get(request):
        """GET Request"""
        try:
            month = request.data["month"]
            year = request.data["year"]
        except KeyError as exception:
            raise ValidationError from exception

        if not HallOfFame.objects.filter(month=month, year=year).exists():
            raise ValidationError

        employee = HallOfFame.objects.get(month=month, year=year).employee
        employee = {
            key: employee.__dict__[key] for key in ["first_name", "last_name"]
        }
        return Response(employee)


class AttendanceView(APIView):
    """API View for users to interact with attendance"""

    CHOICES = [i[1] for i in EmployeeAttendance.STATUS]

    def post(self, request):
        _check_admin(request)
        try:
            attendance = request.data["attendance"]
            attendance_date = datetime.strptime(
                request.data["attendanceDate"], "%d-%m-%Y"
            ).replace(tzinfo=IST)
        except KeyError as exception:
            raise ValidationError from exception

        if (
                attendance_date >
                (datetime.today() + timedelta(minutes=1439)).replace(tzinfo=IST)
        ):
            raise ValidationError

        employees = User.objects.filter(is_admin=False, is_staff=False).all()
        if EmployeeAttendance.objects.filter(date=attendance_date).exists():
            raise ValidationError

        for employee in employees:
            employee = str(employee)
            if employee not in attendance:
                raise ValidationError

            if attendance[employee] not in self.CHOICES:
                raise ValidationError

        for employee in employees:
            EmployeeAttendance.objects.create(
                employee=employee,
                date=attendance_date,
                status=self.CHOICES.index(attendance[str(employee)]),
            )

        return Response({"message": "Attendance successfully saved"})

    def get(self, request):
        try:
            from_date = datetime.strptime(
                request.data["fromDate"], "%d-%m-%Y"
            ).replace(tzinfo=IST)

            to_date = datetime.strptime(
                request.data["toDate"], "%d-%m-%Y"
            ).replace(tzinfo=IST)
        except KeyError as exception:
            raise ValidationError from exception

        employee = _get_employee(request)

        attendance = EmployeeAttendance.objects.filter(
            employee=employee, date__gte=from_date, date__lte=to_date
        ).values()

        data = {}
        total = 0
        present = 0

        for i in attendance:
            status = i["status"]
            date = datetime.strftime(i["date"], "%d-%m-%Y")
            data[date] = self.CHOICES[status]

            if status != 1:
                total += 1

            if status == 2:
                present += 1

        return Response(
                {
                    "attendance": data,
                    "stats": {
                        "presentPercent": f"{100 * round(present/total, 4)}%"
                    }
                }
            )

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


class LeaveApplicationView(APIView):
    """API View for users to interact with hall of view"""

    DECISIONS = [i[1] for i in LeaveApplication.DECISION]
    TYPES = [i[1] for i in LeaveApplication.TYPE]

    def post(self, request):
        """POST Request"""
        if _check_admin(request, raise_error=False):
            raise AuthenticationFailed

        try:
            start_date = datetime.strptime(
                request.data["startDate"], "%d-%m-%Y"
            ).replace(tzinfo=IST)
            end_date = datetime.strptime(
                request.data["endDate"], "%d-%m-%Y"
            ).replace(tzinfo=IST)
            reason = request.data["reason"]
            leave_type = request.data["leaveType"]

        except KeyError as exception:
            raise ValidationError from exception

        if leave_type not in self.TYPES:
            raise ValidationError

        if end_date < start_date:
            return Response(
                {"message": "The end date cannot be less than the start date"},
                status=400,
            )

        if (
                start_date <
                (datetime.today() + timedelta(days=2)).replace(tzinfo=IST)
        ):
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
            type=self.TYPES.index(leave_type),
        )
        return Response({"message": "Successfully applied for leave"})

    def patch(self, request):
        _check_admin(request)

        try:
            application_id = request.data["applicationId"]
            decision = request.data["decision"]
        except KeyError as exception:
            raise ValidationError from exception

        if decision not in self.DECISIONS:
            raise ValidationError

        if not LeaveApplication.objects.filter(id=application_id).exists():
            raise ValidationError

        application_obj = LeaveApplication.objects.get(id=application_id)
        application_obj.decision_date = datetime.today().replace(tzinfo=IST)
        application_obj.decision = self.DECISIONS.index(decision)
        application_obj.save()

        return Response({"message": "Successfully updated"})

    def get(self, request):
        user = _get_employee(request)
        applications = LeaveApplication.objects.filter(employee=user).all()
        data = []

        for app in applications.values():
            data.append(
                {
                    "employeeName": f"{user.first_name} {user.last_name}",
                    "createdAt": app["created_at"],
                    "startDate": app["start_date"],
                    "endDate": app["start_date"],
                    "reason": app["reason"],
                    "leaveType": self.TYPES[app["type"]],
                    "decision": self.DECISIONS[app["decision"]],
                    "decisionDate": app["decision_date"],
                }
            )

        return Response(data)


def _get_employee(request):
    if _check_admin(request, raise_error=False):
        try:
            employee_email = request.data["employee"]
        except KeyError as exception:
            raise ValidationError from exception

    else:
        employee_email = request.user.email

    if not User.objects.filter(email=employee_email).exists():
        raise ValidationError

    user = User.objects.get(email=employee_email)

    return user


def _check_admin(request, raise_error=True):
    admin = request.user.is_admin or request.user.is_staff
    if not admin and raise_error:
        raise AuthenticationFailed

    return admin


METHODS_BY_PATHS = {
    "leave-application": LeaveApplicationView.as_view(),
    "hall-of-fame": HallOfFameView.as_view(),
    "attendance": AttendanceView.as_view(),
}
