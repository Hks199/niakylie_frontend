import { ProfileForm } from '../../components/account/ProfileForm';

export function ProfilePage() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-sm">
      <ProfileForm />
    </div>
  );
}

export default ProfilePage;
