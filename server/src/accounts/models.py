from uuid import uuid4 as _uuid4

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class LeaveApplication(models.Model):
    TYPE = (
        (0, "casual"),
        (1, "vacation"),
        (2, "medical"),
        (3, "maternity"),
        (4, "paternity"),
        (5, "sabbatical"),
        (6, "bereavement"),
        (7, "other"),
    )

    DECISION = (
        (0, "rejected"),
        (1, "pending"),
        (2, "approved"),
    )

    id = models.UUIDField(primary_key=True, default=_uuid4, editable=False)
    type = models.IntegerField(choices=TYPE, null=False)
    employee = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    created_at = models.DateField(auto_now_add=True, null=False)
    start_date = models.DateField(null=False)
    end_date = models.DateField(null=False)
    reason = models.CharField(max_length=512, null=False)
    decision = models.IntegerField(choices=DECISION, default=0)
    decision_date = models.DateField(null=True)


class EmployeeAttendance(models.Model):
    """Employee Attendance model which stores the employees' attendance"""
    class Meta:
        unique_together = (('date', 'employee'),)

    STATUS = (
        (0, "Absent"),
        (1, "Not Expected"),
        (2, "Present")
    )

    employee = models.ForeignKey(User, null=False, on_delete=models.CASCADE)
    date = models.DateField(null=False)
    status = models.IntegerField(choices=STATUS, default=0)


class HallOfFame(models.Model):
    """Employee Attendance model which stores the employees' attendance"""
    class Meta:
        unique_together = (('month', 'year'),)

    employee = models.ForeignKey(User, null=False, on_delete=models.CASCADE)
    month = models.IntegerField(null=False)
    year = models.IntegerField(null=False)
