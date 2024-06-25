from courses.models import Course, CourseSchedule

def base_data(request):
    data = {}
    all_courses = Course.objects.live().all()
    schedules = CourseSchedule.objects.all()
    data["all_courses"] = all_courses
    data["schedules"] = schedules
    return data