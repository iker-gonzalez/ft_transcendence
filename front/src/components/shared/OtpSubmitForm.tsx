import React from 'react';
import { OTP_LENGTH } from '../../constants/shared';
import MainButton from '../UI/MainButton';
import MainInput from '../UI/MainInput';
import styled from 'styled-components';

type OtpSubmitFormProps = {
  otpValue: string;
  setOtpValue: React.Dispatch<React.SetStateAction<string>>;
  handleActivateWithOTP: () => void;
  calloutText?: string;
};

const StyledForm = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const OtpSubmitForm: React.FC<OtpSubmitFormProps> = ({
  otpValue,
  setOtpValue,
  handleActivateWithOTP,
  calloutText,
}): JSX.Element => {
  return (
    <StyledForm
      onSubmit={(e) => {
        e.preventDefault();

        if (otpValue.length !== OTP_LENGTH) return;

        handleActivateWithOTP();
      }}
    >
      <MainInput
        type="text"
        placeholder="Enter OTP"
        maxLength={OTP_LENGTH}
        value={otpValue}
        onChange={(e) => {
          const value = e.target.value;
          if (value.match(/^[0-9]*$/)) {
            setOtpValue(e.target.value);
          }
        }} // Update state on input change
      />
      <MainButton type="submit">{calloutText ?? 'Sign In'}</MainButton>
    </StyledForm>
  );
};

export default OtpSubmitForm;
