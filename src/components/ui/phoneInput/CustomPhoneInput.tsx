import React from 'react';
// Import the library
import PhoneInputBase from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './PhoneInput.css'

const PhoneInput = (PhoneInputBase as any).default || PhoneInputBase;

interface CustomPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CustomPhoneInput: React.FC<CustomPhoneInputProps> = ({ value, onChange }) => {
  return (
    <div>
      <PhoneInput
        country="in"
        value={value}
        onChange={onChange}
        placeholder="Enter phone number"
        enableSearch={true}
        searchPlaceholder="Search country..."
        inputStyle={{
          width: '100%',
          height: '42px',
          borderRadius: '0.5rem',
          border: '1px solid #d1d5db',
          paddingLeft: '48px',
          fontSize: '0.875rem',
        }}
        dropdownStyle={{
          maxHeight: '200px',
          overflowY: 'auto',
          borderRadius: '0.5rem',
        }}
      />
    </div>
  );
};

export default CustomPhoneInput;