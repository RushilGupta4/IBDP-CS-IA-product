from django.contrib import admin
from .models import LeaveApplication, HallOfFame, EmployeeAttendance

# Register your models here.
admin.site.register(LeaveApplication)
admin.site.register(HallOfFame)
admin.site.register(EmployeeAttendance)
