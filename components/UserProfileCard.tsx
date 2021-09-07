export default function UserProfileCard({ user }) {
  return (
    <div className="p-4 shadow-md border space-y-1 max-w-md">
      <h1 className="text-lg text-blue-gray-900">Name: {user.full_name}</h1>
      <h4>Email: {user.user_email}</h4>
      <h4>ID: {user.user_id}</h4>
      <h4>ORG: {user.org_url_name}</h4>
      <h4>Created: {user.created_at}</h4>
    </div>
  );
}
