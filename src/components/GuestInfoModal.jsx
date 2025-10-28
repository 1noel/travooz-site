import React, { useEffect, useState } from "react";

const initialState = {
  firstName: "",
  email: "",
  phone: "",
  specialRequest: "",
};

const validate = (values) => {
  const errors = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required";
  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email";
  }
  if (!values.phone.trim()) {
    errors.phone = "Phone is required";
  }
  return errors;
};

const GuestInfoModal = ({
  isOpen,
  onClose,
  onSubmit,
  itemName,
  initialData,
}) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Prefill with initialData when provided (for edit flows)
      setValues({
        ...initialState,
        ...(initialData || {}),
      });
      setErrors({});
      setSubmitting(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = async () => {
    const v = validate(values);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSubmitting(true);
    try {
      await Promise.resolve();
      onSubmit?.(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Guest Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {itemName && (
            <div className="text-sm text-gray-600">
              Booking for:{" "}
              <span className="font-medium text-gray-800">{itemName}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First name
            </label>
            <input
              type="text"
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              className={`w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 ${
                errors.firstName ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              className={`w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 ${
                errors.email ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number
            </label>
            <input
              type="tel"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              className={`w-full border-2 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 ${
                errors.phone ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="07xxxxxxxx"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special request (optional)
            </label>
            <textarea
              name="specialRequest"
              value={values.specialRequest}
              onChange={handleChange}
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
              placeholder="Any preferences or notes"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestInfoModal;
