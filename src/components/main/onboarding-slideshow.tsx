
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrgFormData {
  domain: string;
  website: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  [key: string]: string; // To accommodate any other fields
}
const OnboardingSlideshow: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<OrgFormData>({
      domain: '',
      website: '',
      name: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      zip_code: '',
    });
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
  
    const validateInput = () => {
      const { domain, website, name, address1, address2, city, state, zip_code } = formData;
      switch (currentStep) {
        case 0:
          return name.trim() !== '';
        case 1:
          return email.trim() !== '';
        case 2:
          return password.trim() !== '';
        case 3:
          return age.trim() !== '';
        default:
          return false;
      }
    };
  
    const handleNext = () => {
      if (validateInput()) {
        setError(null);
        if (currentStep < slides.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          handleSubmit();
        }
      } else {
        setError('Please fill out this field.');
      }
    };
  
    const handlePrev = () => {
      if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      }
    };

  const slides = [
    {
      title: "What is your organization's name?",
      content: (
        <div>
        <input
          type="text"
          name="name"
          placeholder='McDonalds'
          value={formData.name}
          onChange={handleChange}
          className="text-black mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
          required
        />
        </div>
      ),
    },
    {
      title: 'Tell us a bit more about your org',
      content: (
        <div>
        <input
          type="text"
          name="address_1"
          value={formData.address1}
          onChange={handleChange}
          required
          placeholder="12 Cupertino drive"
          className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
        />
        <input
          type="text"
          name="Any suite or office number?"
          value={formData.address2}
          onChange={handleChange}
          placeholder="Suite 200"
          className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
        />
        <input
          type="text"
          name="City"
          value={formData.city}
          onChange={handleChange}
          placeholder="Suite 200"
          className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
        />
        <input
          type="text"
          name="State"
          value={formData.state}
          onChange={handleChange}
          placeholder="Suite 200"
          className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
        />
        <input
          type="text"
          name="Zip code"
          value={formData.zipCode}
          onChange={handleChange}
          placeholder="Suite 200"
          className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        </div>
      ),
    },
    {
      title: 'Step 3: Enter your password',
      content: (
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      ),
    },
    {
      title: 'Step 4: Enter your age',
      content: (
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="Age"
          className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      ),
    },
  ];

  return (
    <div className="bg-white px-6 pb-20 pt-16 lg:px-8 lg:pb-8 lg:pt-8 rounded-lg shadow-lg">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">{slides[currentStep].title}</h2>
        <div className="mt-4">{slides[currentStep].content}</div>
        <div className="mt-6 flex justify-between">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600"
            >
              Previous
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            {currentStep === slides.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSlideshow;
