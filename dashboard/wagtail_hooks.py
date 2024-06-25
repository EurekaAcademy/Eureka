from wagtail.admin.panels import FieldPanel
from wagtail.admin.ui.tables import UpdatedAtColumn
from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import SnippetViewSet
from wagtail.admin.panels import TabbedInterface, TitleFieldPanel, ObjectList

from dashboard.models import RegisterProgramSelection, UserEnrolInfo, Profile

# class EnrolProgramSelectionViewSet(SnippetViewSet):
#     model = RegisterProgramSelection
#     icon = "tasks"
#     list_display = ["schedule", UpdatedAtColumn()]
#     list_export = ["schedule"]
#     list_per_page = 50
#     inspect_view_enabled = True
#     admin_url_namespace = "enrol_program_selection_views"
#     base_url_path = "internal/enrol_program_selection"
#     # filterset_class = OrderFilterSet

#     edit_handler = TabbedInterface([
#         ObjectList([FieldPanel("program")], heading="Details"),
#         ObjectList([FieldPanel("program_type")], heading="Preferences"),
#     ])

# register_snippet(EnrolProgramSelectionViewSet)

class UserEnrolInfoViewSet(SnippetViewSet):
    model = UserEnrolInfo
    icon = "user"
    list_display = ["first_name", "last_name", "email", "phone_number", UpdatedAtColumn()]
    list_export = ["first_name", "last_name", "email", "phone_number"]
    list_per_page = 50
    inspect_view_enabled = True
    admin_url_namespace = "user_enrol_info_views"
    base_url_path = "internal/user_enrol_info"
    # filterset_class = OrderFilterSet

    edit_handler = TabbedInterface([
        ObjectList([FieldPanel("first_name")], heading="Details"),
        ObjectList([FieldPanel("email")], heading="Preferences"),
    ])

register_snippet(UserEnrolInfoViewSet)

class ProfileViewSet(SnippetViewSet):
    model = Profile
    icon = "user"
    list_display = ["user", "schedule", UpdatedAtColumn()]
    list_export = ["user", "schedule"]
    list_per_page = 50
    inspect_view_enabled = True
    admin_url_namespace = "profile_views"
    base_url_path = "internal/profile"
    # filterset_class = OrderFilterSet

register_snippet(ProfileViewSet)