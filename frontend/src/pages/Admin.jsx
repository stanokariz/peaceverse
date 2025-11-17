const Admin = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 dark:from-gray-600 dark:via-gray-500 dark:to-gray-400 rounded-lg shadow-lg text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Admin Panel</h1>
      <p className="text-lg md:text-xl">
        Only administrators can access this page. Manage users, monitor activity,
        and maintain platform integrity from here.
      </p>
    </div>
  );
};

export default Admin;
