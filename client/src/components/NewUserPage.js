import React, { useState, useEffect } from 'react';
import './NewUserPage.css';

function NewUserPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [breed, setBreed] = useState('');
  const [photoId, setPhotoId] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [ref1Name, setRef1Name] = useState('');
  const [ref1Phone, setRef1Phone] = useState('');
  const [ref2Name, setRef2Name] = useState('');
  const [ref2Phone, setRef2Phone] = useState('');
  const [formValid, setFormValid] = useState(false);

  const referencesProvided =
    ref1Name.trim() && ref1Phone.trim() && ref2Name.trim() && ref2Phone.trim();

  const imagesProvided = photoId && selfie;

  const selfieRequired = !(referencesProvided && imagesProvided);
  const referencesRequired = !(photoId && selfie);

  const validateForm = () => {
    const requiredFieldsFilled =
      document.getElementById('name').value.trim() &&
      document.getElementById('phone').value.trim() &&
      document.getElementById('age').value.trim() &&
      document.getElementById('breed').value.trim() &&
      (imagesProvided || referencesProvided);

    setFormValid(requiredFieldsFilled);
  };

  useEffect(() => {
    const basicFieldsFilled =
      name.trim() &&
      phone.trim() &&
      age.trim() &&
      breed.trim();

    const referencesFilled =
      ref1Name.trim() &&
      ref1Phone.trim() &&
      ref2Name.trim() &&
      ref2Phone.trim();

    const imagesFilled = photoId && selfie;

    const valid = basicFieldsFilled && (referencesFilled || imagesFilled);
    setFormValid(valid);
  }, [
    name, phone, age, breed,
    ref1Name, ref1Phone, ref2Name, ref2Phone,
    photoId, selfie
  ]);

  return (
    <div className="page-wrapper">
      <div className="form-spacer" />
      <div className="update-box">
        <h1 className="title-text">New User Registration</h1>
        <p>
          Before using our services, all new users must register. You may submit the form below or text the required information to <strong>(123) 456-7890</strong>. Registration helps us ensure safety, trust, and a smooth experience for everyone.
        </p>
        <p>
          <strong>Note:</strong> Photo ID is optional if you provide two references that can be confirmed.
        </p>

        <form
          action="mailto:your@email.com"
          method="POST"
          encType="multipart/form-data"
          className="registration-form"
        >
          {/* Basic Info */}
          <div className="form-group">
            <label htmlFor="name">Full Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number*</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age*</label>
            <input
              type="number"
              id="age"
              name="age"
              value={age}
              onChange={e => setAge(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="breed">Breed*</label>
            <input
              type="text"
              id="breed"
              name="breed"
              value={breed}
              onChange={e => setBreed(e.target.value)}
              required
            />
          </div>

          {/* Verification Section */}
          <div className="form-box">
            <div className="form-subgroup">
              <div className="form-group">
                <label htmlFor="photo-id">Upload Photo ID</label>
                <input
                  type="file"
                  id="photo-id"
                  name="photo-id"
                  accept="image/*"
                  onChange={e => {
                    setPhotoId(e.target.files[0]);
                    validateForm();
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="selfie">Upload Selfie{!referencesProvided && '*'}</label>
                <input
                  type="file"
                  id="selfie"
                  name="selfie"
                  accept="image/*"
                  onChange={e => {
                    setSelfie(e.target.files[0]);
                    validateForm();
                  }}
                />
              </div>
            </div>

            <div className="or-divider">OR</div>

            <div className="form-subgroup">
              <div className="form-group">
                <label htmlFor="ref1-name">Reference 1 – Company Name*</label>
                <input
                  type="text"
                  id="ref1-name"
                  name="ref1-name"
                  value={ref1Name}
                  onChange={e => {
                    setRef1Name(e.target.value);
                    validateForm();
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ref1-phone">Reference 1 – Phone*</label>
                <input
                  type="tel"
                  id="ref1-phone"
                  name="ref1-phone"
                  value={ref1Phone}
                  onChange={e => {
                    setRef1Phone(e.target.value);
                    validateForm();
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ref2-name">Reference 2 – Company Name*</label>
                <input
                  type="text"
                  id="ref2-name"
                  name="ref2-name"
                  value={ref2Name}
                  onChange={e => {
                    setRef2Name(e.target.value);
                    validateForm();
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ref2-phone">Reference 2 – Phone*</label>
                <input
                  type="tel"
                  id="ref2-phone"
                  name="ref2-phone"
                  value={ref2Phone}
                  onChange={e => {
                    setRef2Phone(e.target.value);
                    validateForm();
                  }}
                />
              </div>
            </div>
          </div>

          {/* Optional Message */}
          <div className="form-group">
            <label htmlFor="message">Requests or Questions (optional)</label>
            <textarea id="message" name="message" rows="4" />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`button available ${formValid ? 'active' : 'inactive'}`}
            disabled={!formValid}
          >
            Submit Registration
          </button>
        </form>

        <p style={{ marginTop: '1rem' }}>
          Prefer texting? You can send all the above information to <strong>(123) 456-7890</strong> instead.
        </p>
      </div>
    </div>
  );
}

export default NewUserPage;
