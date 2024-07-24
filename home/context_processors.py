from courses.models import Course
from dashboard.models import CourseSchedule, Pricing

def base_data(request):
    data = {}
    all_courses = Course.objects.live().all()
    schedules = CourseSchedule.objects.all()
    pricing = Pricing.objects.all()
    data["all_courses"] = all_courses
    data["schedules"] = schedules
    data["pricing"] = pricing
    return data