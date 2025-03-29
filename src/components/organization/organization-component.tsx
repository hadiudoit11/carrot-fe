'use client';

const OrganizationComponent = () => {
    console.log('Attempting backend request to:', process.env.NEXT_PUBLIC_BACKEND_URL);
  console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Organization Settings</h1>
      {/* Add your organization-specific content here */}
    </div>
  );
};

export default OrganizationComponent; 