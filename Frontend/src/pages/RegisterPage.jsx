import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { registerUser } from "../services/authApi";

function RegisterPage() {
  const [formData, setFormData] = useState({
    role: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: "",
    businessName: "",
    aadharNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const roleFromState = location.state?.selectedRole;
    if (roleFromState) {
      setFormData((prev) => ({ ...prev, role: roleFromState }));
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.role) newErrors.role = "Please select a role";
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (formData.role === "dealer" && !formData.businessName.trim()) {
      newErrors.businessName = "Business name is required for dealers";
    }

    if (formData.role === "farmer") {
      if (!/^\d{12}$/.test(formData.aadharNumber)) {
        newErrors.aadharNumber = "Aadhar number must be 12 digits";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerUser({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (res.message === "Registration successful") {
        alert("Registration successful. Please login.");
        navigate("/login");
      } else {
        setErrors({ submit: res.message || "Registration failed" });
      }
    } catch (error) {
      setErrors({ submit: "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      farmer: "Farmer",
      dealer: "Dealer",
      admin: "Admin",
    };
    return roleMap[role] || "Select Role";
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-green-800">AGROFARM</h1>
          </Link>
          <h2 className="mt-6 text-xl md:text-2xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join as {formData.role ? getRoleDisplayName(formData.role) : "a user"}
          </p>
        </div>

        <form
          className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-green-100"
          onSubmit={handleSubmit}
        >
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          {/* Role Selection */}
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am a *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-xl w-full">
              {["farmer", "dealer", "admin"].map((role) => (
                <div
                  key={role}
                  onClick={() =>
                    handleChange({ target: { name: "role", value: role } })
                  }
                  className={`border-2 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    formData.role === role
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-green-300"
                  }`}
                >
                  <div className="text-3xl mb-2">
                    {role === "farmer" && "🌾"}
                    {role === "dealer" && "🏪"}
                    {role === "admin" && "🛡️"}
                  </div>
                  <div className="font-medium text-gray-800 capitalize">
                    {role}
                  </div>
                </div>
              ))}
            </div>

            {errors.role && (
              <p className="mt-2 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.fullName ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.fullName && (
                <p className="text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.phone ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.location ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.location && (
                <p className="text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {formData.role === "dealer" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.businessName ? "border-red-300" : "border-gray-300"
                  }`}
                />
              </div>
            )}

            {formData.role === "farmer" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Number *
                </label>
                <input
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.aadharNumber ? "border-red-300" : "border-gray-300"
                  }`}
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
