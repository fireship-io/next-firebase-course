// UI component for user profile
export default function UserProfile({ user }) {
  return (
    <div className="box-center">
      <img src={user.photoURL || '/hacker.png'} className="card-img-center" />
      <p>
        <i>@{user.username}</i>
      </p>
      <h1>{user.displayName || 'Anonymous User'}</h1>
    </div>
  );
}
