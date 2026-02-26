import { useState } from "react";
import {
  ProfileSidebar,
  type ProfileSection,
} from "@/components/profile/ProfileSidebar";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { ComingSoonPlaceholder } from "@/components/profile/ComingSoonPlaceholder";

export function ProfilePage() {
  const [activeSection, setActiveSection] =
    useState<ProfileSection>("personal-info");

  const renderContent = () => {
    switch (activeSection) {
      case "personal-info":
        return <PersonalInfoForm />;
      case "change-password":
        return <ChangePasswordForm />;
      default:
        return <ComingSoonPlaceholder section={activeSection} />;
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-6 md:flex-row">
        <ProfileSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <div className="min-h-[500px] flex-1 rounded-xl border bg-white p-6 shadow-sm">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
