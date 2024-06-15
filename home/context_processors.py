from courses.models import Course

def base_data(request):
    data = {}
    all_courses = Course.objects.live().all()
    data["all_courses"] = all_courses
    return data