import React, { forwardRef } from "react";
import './style.css';

<<<<<<< HEAD
const InputBox = forwardRef((props, ref) => {
  const { title, placeholder, type, value, isErrorMessage, buttonTitle, message, onChange, onKeyDown, onButtonClick } = props;

  const buttonClass = value === '' ? 'input-box-button-disable' : 'input-box-button';
  const messageClass = isErrorMessage ? 'input-box-message-error' : 'input-box-message';

=======

const InputBox = forwardRef((props, ref) => {
  const { title, placeholder, type, value, isErrorMessage, buttonTitle, message, onChange, onKeyDown, onButtonClick } = props;


  const buttonClass = value === '' ? 'input-box-button-disable' : 'input-box-button';
  const messageClass = isErrorMessage ? 'input-box-message-error' : 'input-box-message';


>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
  return (
    <div className="input-box">
      <div className="input-box-title">{title}</div>
      <div className="input-box-content">
        <div className="input-box-body">
          <input ref={ref} className="input-box-input" placeholder={placeholder} type={type} value={value} onChange={onChange} onKeyDown={onKeyDown} />
          {buttonTitle !== undefined && onButtonClick !== undefined && <div className={buttonClass} onClick={onButtonClick}>{buttonTitle}</div>}
        </div>
        {message !== undefined && <div className={messageClass}>{message}</div>}
      </div>
    </div>
  );
});

<<<<<<< HEAD
=======

>>>>>>> 9207541e5f044c8bbc0c9160ef8f8c4d9a2f76cd
export default InputBox;
