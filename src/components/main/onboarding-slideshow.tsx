import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiPost } from "@/providers/apiRequest";

interface FormData {
  name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone_number: string;
  [key: string]: string;
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
    zip_code: "",
    phone_number: "",
    country: ""
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const router = useRouter();
  const { update: updateSession } = useSession();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateInput = () => {
    const { name, address_1, address_2, city, state, zip_code, country, phone_number} = formData;
    const newErrors: Partial<FormData> = {};
    let valid = true;

    switch (currentStep) {
      case 0:
        if (!name.trim()) {
          newErrors.name = "Name is required";
          valid = false;
        }
        break;
      case 1:
        if (!phone_number.trim()) {
          newErrors.address_1 = "Phone number is required";
          valid = false;
        }
        if (!address_1.trim()) {
          newErrors.address_1 = "Address 1 is required";
          valid = false;
        }
        if (!address_2.trim()) {
          newErrors.address_2 = "Address 2 is required";
          valid = false;
        }
        if (!city.trim()) {
          newErrors.city = "City is required";
          valid = false;
        }
        if (!state.trim()) {
          newErrors.state = "State is required";
          valid = false;
        }
        if (!zip_code.trim()) {
          newErrors.zip_code = "Zipcode is required";
          valid = false;
        }
        if (!country.trim()) {
          newErrors.country = "Country is required";
          valid = false;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);

    if (!valid) {
      setGeneralError("Please fill out the required field(s)");
    }

    return valid;
  };

  const handleNext = () => {
    if (validateInput()) {
      setGeneralError(null);
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
      const backendURL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
      
      // Debug the URL and environment variables
      console.log("Backend URL from env:", backendURL);
      console.log("NEXT_PUBLIC_BACKEND_URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
      console.log("BACKEND_URL:", process.env.BACKEND_URL);
      
      const url = `${backendURL}/api/v1/auth/organization/create/`;
      console.log("Full request URL:", url);
      console.log("Form data being sent:", formData);
      
      const response = await apiPost(url, formData);
  
      if (response) {
        console.log("Submission successful:", response);
        console.log("Response keys:", Object.keys(response));
        console.log("Response.organization_id:", response.organization_id);
        console.log("Response.id:", response.id);
        console.log("Response.name:", response.name);
        
        // Update the session to include the new organization data
        console.log("Updating session with new organization data...");
        const organizationId = response.organization_id || response.id;
        const organizationName = response.name;
        
        console.log("Using organization ID:", organizationId);
        console.log("Using organization name:", organizationName);
        
        // Instead of trying to update the session directly, let's redirect to login
        // which will re-authenticate the user and get the updated session with organization
        console.log("Organization created successfully, redirecting to login to refresh session");
        
        // Store a flag in localStorage to indicate we just created an organization
        localStorage.setItem('justCreatedOrganization', 'true');
        
        // Redirect to login page which will automatically redirect back to home
        window.location.href = "/user/login";
      } else {
        setGeneralError("Submission failed - no response returned");
        console.error("Submission failed - no response returned");
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error occurred";
      setGeneralError(`Error: ${errorMessage}`);
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
            className="mt-2 w-full p-3.5 rounded-md text-black border-gray-300 shadow-md focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
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
              name="phone_number"
              value={formData.phone_number || ""}
              onChange={handleChange}
              placeholder="* 111-111-1111"
              className="mt-2 w-full p-3.5 rounded-md text-black border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
            {errors.phone_number && (
              <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>
            )}
          </div>
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
            {errors.address_1 && (
              <p className="text-red-600 text-sm mt-1">{errors.address_1}</p>
            )}
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
            {errors.address_2 && (
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
            {errors.city && (
              <p className="text-red-600 text-sm mt-1">{errors.city}</p>
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
            {errors.state && (
              <p className="text-red-600 text-sm mt-1">{errors.state}</p>
            )}
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              placeholder="* 12345"
              className="mt-2 w-full p-3.5 rounded-md text-black border-gray-300 shadow-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
            {errors.zip_code && (
              <p className="text-red-600 text-sm mt-1">{errors.zip_code}</p>
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
            {errors.country && (
              <p className="text-red-600 text-sm mt-1">{errors.country}</p>
            )}
          </div>
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
