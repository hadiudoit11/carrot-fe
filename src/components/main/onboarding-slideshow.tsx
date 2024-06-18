// components/OnboardingSlideshow.tsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  [key: string]: string; // To accommodate any other fields
}

const COUNTRY_CHOICES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
];

const OnboardingSlideshow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement| HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear the error for the field being edited
  };

  const validateInput = () => {
    const { name, address_1, address_2, city, state, zipcode, country } = formData;
    const newErrors: Partial<FormData> = {};
    let valid = true;
    
    switch (currentStep) {
      case 0:
        if (!name.trim()) valid = false;
        break;
      case 1:
        if (!name.trim()) valid = false;
        if (!address_1.trim()) valid = false;
        if (!address_2.trim()) valid = false;
        if (!city.trim()) valid = false;
        if (!state.trim()) valid = false;
        if (!zipcode.trim()) valid = false;
        if (!country.trim()) valid = false;
        break;
      default:
        break;
      
    }
    
    if (!valid ){
      setGeneralError("Please fill out the required field(s)")
    }

    return valid;
  };




  const handleNext = () => {
    if (validateInput()) {
      setGeneralError(null); // Clear the general error if validation passes
      if (currentStep < slides.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Submission successful:", result);
        router.push("/thank-you");
      } else {
        console.error("Submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const slides = [
    {
      title: "Give your HQ a name!",
      content: (
        <>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Krustycrab Burger"
            className=" mt-2 w-full p-3.5 rounded-md text-black border-gray-300 shadow-md focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            required
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
          )}
        </>
      ),
    },
    {
      title: "Where is it located?",
      content: (
        <>
        <div className="relative mb-4">
          <input
            type="text"
            name="address_1"
            value={formData.address_1 || ""}
            onChange={handleChange}
            placeholder="* 123 sesame street"
            className="mt-2 w-full p-3.5 rounded-md text-black border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
          {/* {errors.email && (
            <p className="text-red-600 text-sm mt-8">{errors.address_1}</p>
          )} */}
        </div>

        <div className="relative mb-4">  
          <input
            type="text"
            name="address_2"
            value={formData.address_2}
            onChange={handleChange}
            placeholder="Suite 300"
            className="mt-2 w-full p-3.5 rounded-md text-black border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.address_2}</p>
          )}
        </div>

        <div className="relative mb-4">  
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="* New York City"
            className="mt-2 w-full p-3.5 rounded-md text-black border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-3">{errors.city}</p>
          )}
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="* New York"
            className="mt-2 w-full p-3.5 rounded-md text-black border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
          {errors.email && (
            <p className="text-red-600 px-2 text-sm mt-1">{errors.state}</p>
          )}
        </div>
        <div>
        <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="mt-2 w-full p-3.5 rounded-md text-black border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select a country</option>
            {COUNTRY_CHOICES.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>
        
        </>
        
        
      ),
    },
    {
      title: "Step 3: Enter your password",
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
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </>
      ),
    },
    {
      title: "Step 4: Enter your age",
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
          {errors.age && (
            <p className="text-red-600 text-sm mt-1">{errors.age}</p>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="bg-white px-6 pb-20 pt-16 lg:px-8 lg:pb-8 lg:pt-8 rounded-lg shadow-lg">
      <div className="max-w-sm mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-orange-600">
          {slides[currentStep].title}
        </h2>
        <div className="mt-4">{slides[currentStep].content}</div>
        {generalError && (
        <p className="text-red-600 text-sm mt-4">{generalError}</p>
      )}
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
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
          >
            {currentStep === slides.length - 1 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSlideshow;
