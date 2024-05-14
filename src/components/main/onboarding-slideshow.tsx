// components/OnboardingSlideshow.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  name: string;
  email: string;
  password: string;
  age: string;
  [key: string]: string; // To accommodate any other fields
}

const OnboardingSlideshow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    age: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear the error for the field being edited
  };

  const validateInput = () => {
    const { name, email, password, age } = formData;
    const newErrors: Partial<FormData> = {};

    switch (currentStep) {
      case 0:
        if (!name.trim()) newErrors.name = 'Name is required.';
        break;
      case 1:
        if (!email.trim()) {
          newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          newErrors.email = 'Email address is invalid.';
        }
        break;
      case 2:
        if (!password.trim()) newErrors.password = 'Password is required.';
        break;
      case 3:
        if (!age.trim()) {
          newErrors.age = 'Age is required.';
        } else if (isNaN(Number(age)) || Number(age) <= 0) {
          newErrors.age = 'Please enter a valid age.';
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleNext = () => {
    if (validateInput()) {
      setErrors({});
      if (currentStep < slides.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Submission successful:', result);
        router.push('/thank-you');
      } else {
        console.error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const slides = [
    {
      title: 'Step 1: Enter your name',
      content: (
        <>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </>
      ),
    },
    {
      title: 'Step 2: Enter your email',
      content: (
        <>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </>
      ),
    },
    {
      title: 'Step 3: Enter your password',
      content: (
        <>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
        </>
      ),
    },
    {
      title: 'Step 4: Enter your age',
      content: (
        <>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Age"
            className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
          {errors.age && <p className="text-red-600 text-sm mt-1">{errors.age}</p>}
        </>
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
