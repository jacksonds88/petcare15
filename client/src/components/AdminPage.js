import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import { API_BASE_URL } from "../apiConfig";
import styles from './AdminPage.module.css';
import bubbleStyles from '../styles/Bubbles.module.css';

function AdminPage() {
  const [updates, setUpdates] = useState([]);
  const [contact, setContact] = useState({
    phoneNumbers: [],
    email: "",
    googleMapsUrl: "",
  });
  const [profiles, setProfiles] = useState([]);
  const [savingUpdates, setSavingUpdates] = useState(false);
  const [updatesMessage, setUpdatesMessage] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [savingProfiles, setSavingProfiles] = useState(false);
  const [profilesMessage, setProfilesMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [imagesToDelete, setImagesToDelete] = useState({});
  const [pendingUploads, setPendingUploads] = useState({});
  const [collapsedProfiles, setCollapsedProfiles] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/admin-check').then(res => {
      if (res.status !== 200) {
        navigate('/admin-login', { state: { from: location.pathname } });
      }
    });
  }, []);

  const cleanFileName = (name) =>
    name
      .normalize("NFKC")
      .replace(/[\u200B-\u200F\u202F\uFEFF]/g, "")
      .replace(/[^\w\s.-]/g, "")
      .replace(/\s+/g, " ");

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/updates`)
      .then((res) => setUpdates(res.data))
      .catch((err) => console.error("Error fetching updates:", err));

    axios.get(`${API_BASE_URL}/api/contact`)
      .then((res) => setContact(res.data))
      .catch((err) => console.error("Error fetching contact:", err));

    axios.get(`${API_BASE_URL}/api/profiles`)
      .then((res) => {
        const collapsed = {};
        res.data.forEach(p => collapsed[p.id] = true);
        setCollapsedProfiles(collapsed);
        setProfiles(res.data);
      })
      .catch((err) => console.error("Error fetching profiles:", err));
  }, []);

  const handleSaveUpdates = async () => {
    setSavingUpdates(true);
    setUpdatesMessage("");

    try {
      // Determine the highest existing ID
      const maxId = updates.reduce((max, u) => {
        return typeof u.id === "number" && u.id > max ? u.id : max;
      }, 0);

      let nextId = maxId + 1;

      const validUpdates = updates
        .filter((u) => typeof u.update === "string" && u.update.trim())
        .map((u) => ({
          id: typeof u.id === "number" ? u.id : nextId++, // ✅ assign new ID only if missing
          update: u.update.trim(),
        }));

      const response = await fetch(`${API_BASE_URL}/api/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validUpdates),
      });

      if (!response.ok) throw new Error("Failed to save updates");
      setUpdatesMessage("✅ Updates saved successfully");
    } catch (err) {
      setUpdatesMessage("❌ Failed to save updates");
      console.error(err);
    } finally {
      setSavingUpdates(false);
      setTimeout(() => setUpdatesMessage(""), 3000);
    }
  };

  const handleSaveContact = async () => {
    setSavingContact(true);
    setContactMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });

      if (!response.ok) throw new Error("Failed to save contact info");
      setContactMessage("✅ Contact info saved successfully");
    } catch (err) {
      setContactMessage("❌ Failed to save contact info");
      console.error(err);
    } finally {
      setSavingContact(false);
      setTimeout(() => setContactMessage(""), 3000);
    }
  };

  const handleImageDeletions = async (profileId, deletions, updatedProfile) => {
    if (!deletions || Object.keys(deletions).length === 0) return;

    try {
      await fetch(`${API_BASE_URL}/api/delete-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, deletions }),
      });

      for (const key in deletions) {
        const value = deletions[key];

        if (value === true) {
          updatedProfile[key] = "";
        } else if (Array.isArray(value)) {
          if (key === "special_gallery") {
            updatedProfile.special_gallery = {
              ...(updatedProfile.specialGallery || {}),
              gallery: (updatedProfile.specialGallery?.gallery || []).filter(
                (file) => !value.includes(file),
              ),
            };
          } else {
            updatedProfile[key] = (updatedProfile[key] || []).filter(
              (file) => !value.includes(file),
            );
          }
        }
      }
    } catch (err) {
      console.error("Failed to delete images:", err);
    }
  };

  const handleSaveProfile = (index) => async () => {
    const profile = profiles[index];
    const errors = {};
    const messages = [];

    // Validation
    if (!profile.name.trim()) {
      errors.name = true;
      messages.push("Name cannot be empty");
    }
    if (/\d/.test(profile.name)) {
      errors.name = true;
      messages.push("Name cannot contain numbers");
    }
    if (
      typeof profile.heightCm === "string" &&
      profile.heightCm.trim() !== "" &&
      /\D/.test(profile.heightCm)
    ) {
      errors.heightCm = true;
      messages.push("Height (cm) must be a valid number");
    }
    if (
      typeof profile.weightKg === "string" &&
      profile.weightKg.trim() !== "" &&
      /\D/.test(profile.weightKg)
    ) {
      errors.weightKg = true;
      messages.push("Weight (kg) must be a valid number");
    }
    if (/\d/.test(profile.breed)) {
      errors.breed = true;
      messages.push("Breed cannot contain numbers");
    }

    try {
      if (messages.length > 0) {
        setValidationErrors({ [profile.id]: errors });
        throw new Error(messages.join(", "));
      }

      setValidationErrors({});
      setSavingProfiles(true);
      setProfilesMessage("");

      const uploads = pendingUploads[profile.id] || {};
      const uploadedGalleryFiles = [];
      const uploadedSpecialGalleryFiles = [];

      // Upload first
      if (uploads.profileThumbnail) {
        const formData = new FormData();
        formData.append("image", uploads.profileThumbnail);
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/upload-image?profileId=${profile.id}`,
            {
              method: "POST",
              body: formData,
            },
          );
          if (!res.ok) throw new Error("Thumbnail upload failed");
          const result = await res.json();
          profile.profileThumbnail = result.filename;
        } catch (err) {
          console.error("Thumbnail upload failed:", err);
          messages.push("Thumbnail upload failed");
        }
      }

      if (uploads.profile_full_image) {
        const formData = new FormData();
        formData.append("image", uploads.profileFullImage);
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/upload-image?profileId=${profile.id}`,
            {
              method: "POST",
              body: formData,
            },
          );
          if (!res.ok) throw new Error("Full image upload failed");
          const result = await res.json();
          profile.profileFullImage = result.filename;
        } catch (err) {
          console.error("Full image upload failed:", err);
          messages.push("Full image upload failed");
        }
      }

      if (uploads.gallery && Array.isArray(uploads.gallery)) {
        for (const file of uploads.gallery) {
          const formData = new FormData();
          formData.append("image", file);
          try {
            const res = await fetch(
              `${API_BASE_URL}/api/upload-image?profileId=${profile.id}`,
              {
                method: "POST",
                body: formData,
              },
            );
            if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
            const result = await res.json();
            uploadedGalleryFiles.push(result.filename);
          } catch (err) {
            console.error(`Gallery image upload failed: ${file.name}`, err);
            messages.push(`Failed to upload ${file.name}`);
          }
        }
      }

      if (uploads.specialGallery && Array.isArray(uploads.specialGallery)) {
        for (const file of uploads.specialGallery) {
          const formData = new FormData();
          formData.append("image", file);
          try {
            const res = await fetch(
              `${API_BASE_URL}/api/upload-image?profileId=${profile.id}`,
              {
                method: "POST",
                body: formData,
              },
            );
            if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
            const result = await res.json();
            uploadedSpecialGalleryFiles.push(result.filename);
          } catch (err) {
            console.error(
              `Special gallery image upload failed: ${file.name}`,
              err,
            );
            messages.push(`Failed to upload ${file.name}`);
          }
        }
      }

      // Now apply deletions
      const deletions = imagesToDelete[profile.id];
      const updatedProfile = { ...profile };

      await handleImageDeletions(profile.id, deletions, updatedProfile);

      // Merge uploads into cleaned profile
      updatedProfile.gallery = Array.from(
        new Set([...(updatedProfile.gallery || []), ...uploadedGalleryFiles]),
      );

      updatedProfile.specialGallery = {
        ...(updatedProfile.specialGallery || {}),
        gallery: Array.from(
          new Set([
            ...(updatedProfile.specialGallery?.gallery || []),
            ...uploadedSpecialGalleryFiles,
          ]),
        ),
      };

      // Clear deletion and upload state
      setImagesToDelete((prev) => {
        const updated = { ...prev };
        delete updated[profile.id];
        return updated;
      });

      setPendingUploads((prev) => {
        const updated = { ...prev };
        delete updated[profile.id];
        return updated;
      });

      // Save profile
      const response = await fetch(
        `${API_BASE_URL}/api/profiles/${updatedProfile.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProfile),
        },
      );

      if (!response.ok)
        throw new Error("Network error: Failed to save profile");

      setProfiles((prev) =>
        prev.map((p, i) =>
          i === index
            ? {
                ...p,
                ...updatedProfile,
                __status: "✅ Profile saved successfully",
              }
            : p,
        ),
      );

      setProfilesMessage("✅ Profile saved successfully");
    } catch (err) {
      const newProfiles = [...profiles];
      newProfiles[index].__status = `❌ ${err.message}`;
      setProfiles(newProfiles);
      setProfilesMessage(`❌ ${err.message}`);
      console.error(err);
    } finally {
      setSavingProfiles(false);
      setTimeout(() => {
        const reset = [...profiles];
        if (reset[index]) delete reset[index].__status;
        setProfiles(reset);
        setProfilesMessage("");
      }, 4000);
    }
  };

  const handleAddProfile = () => {
    const defaultName = "New Profile";
    const baseId = defaultName.toLowerCase().replace(/\s+/g, "");
    let newId = baseId;
    let counter = 1;

    while (profiles.some((p) => p.id === newId)) {
      newId = `${baseId}${counter}`;
      counter++;
    }

    const newProfile = {
      id: newId,
      name: defaultName,
      available: false,
      heightCm: "",
      weightKg: "",
      harness_size: "",
      breed: "",
      highlights: "",
      aboutMe: "",
      reviewLink: "",
      indoorServices: "",
      outdoorServices: "",
      profileThumbnail: "",
      profileFullImage: "",
      gallery: [],
      specialGallery: {
        description: "",
        gallery: [],
      },
      __collapsed: false,
    };

    setProfiles([...profiles, newProfile]);
  };

  return (
<div className={styles.adminWrapper}>      
  <h1>Admin Page</h1>

{/* Updates Section */}
<div className={styles.formSection}>
  <h2>Edit Updates</h2>

  {updates.map((item, index) => (
    <div key={item.id} className={styles.inputRow}>
      <label className={styles.fieldLabel}>Update {index + 1}</label>
      <input
        type="text"
        value={item.update}
        onChange={(e) => {
          const newUpdates = [...updates];
          newUpdates[index].update = e.target.value;
          setUpdates(newUpdates);
        }}
        className={styles.inputField}
      />
      <span
        className={styles.deleteIcon}
        onClick={() => {
          const newUpdates = updates.filter((_, i) => i !== index);
          setUpdates(newUpdates);
        }}
      >
        ❌
      </span>
    </div>
  ))}

  <div className={styles.addRow}>
    <button
      className={styles.button}
      onClick={() => {
        const nextId = updates.length
          ? Math.max(...updates.map((u) => typeof u.id === "number" ? u.id : 0)) + 1
          : 1;
        setUpdates([...updates, { id: nextId, update: "" }]);
      }}
    >
      + Update
    </button>
  </div>

  <div className={styles.saveRow}>
    <button
      className={styles.button}
      onClick={handleSaveUpdates}
      disabled={savingUpdates}
    >
      {savingUpdates ? "Saving..." : "Save Changes"}
    </button>
  </div>

  {updatesMessage && (
    <div className={styles.saveFeedback}>{updatesMessage}</div>
  )}
</div>


{/* Contact Section */}
<div className={styles.formSection}>
  <h2>Edit Contact Info</h2>

  {contact.phoneNumbers.map((num, index) => (
    <div key={index} className={styles.inputRow}>
      <label className={styles.fieldLabel}>Phone Number {index + 1}</label>
      <input
        type="text"
        value={num}
        onChange={(e) => {
          const newPhones = [...contact.phoneNumbers];
          newPhones[index] = e.target.value;
          setContact((prev) => ({ ...prev, phoneNumbers: newPhones }));
        }}
        className={styles.inputField}
      />
      <span
        className={styles.deleteIcon}
        onClick={() => {
          const newPhones = contact.phoneNumbers.filter((_, i) => i !== index);
          setContact((prev) => ({ ...prev, phoneNumbers: newPhones }));
        }}
      >
        ❌
      </span>
    </div>
  ))}

  <div className={styles.addRow}>
    <button
      className={styles.button}
      onClick={() => {
        if (contact.phoneNumbers.length >= 2) return;
        setContact((prev) => ({
          ...prev,
          phoneNumbers: [...prev.phoneNumbers, ""],
        }));
      }}
    >
      + Phone Number
    </button>
  </div>

  <div className={styles.inputRow}>
    <label className={styles.fieldLabel}>Email</label>
    <input
      type="email"
      value={contact.email}
      onChange={(e) =>
        setContact((prev) => ({ ...prev, email: e.target.value }))
      }
      className={styles.inputField}
    />
  </div>

  <div className={styles.inputRow}>
    <label className={styles.fieldLabel}>Google Maps URL</label>
    <input
      type="text"
      value={contact.googleMapsUrl}
      onChange={(e) =>
        setContact((prev) => ({ ...prev, googleMapsUrl: e.target.value }))
      }
      className={styles.inputField}
    />
  </div>

  <div className={styles.saveRow}>
    <button
      className={styles.button}
      onClick={handleSaveContact}
      disabled={savingContact}
    >
      {savingContact ? "Saving..." : "Save Changes"}
    </button>
  </div>

  {contactMessage && (
    <div className={styles.saveFeedback}>{contactMessage}</div>
  )}
</div>


{/* Profiles Section */}
<div className={styles.formSection}>
  <h2>Profiles</h2>

  <div className={styles.addRow}>
    <button className={styles.button} onClick={handleAddProfile}>
      + Add New Profile
    </button>
  </div>

  {profiles.map((profile, index) => (
    <div key={profile.id} className={styles.profileDetailsBlock}>
      <div className={styles.profileHeader}>
        <h3
          className={`${styles.collapsibleTitle} ${bubbleStyles.bubbleStyle} ${bubbleStyles.contactWrapper}`}
          onClick={() =>
            setCollapsedProfiles((prev) => ({
              ...prev,
              [profile.id]: !prev[profile.id],
            }))
          }
        >
          {profile.name} {collapsedProfiles[profile.id] ? '▼' : '▲'}
        </h3>
      </div>

      {!collapsedProfiles[profile.id] && (
        <>
          <div className={styles.checkboxRow}>
            <label className={styles.fieldLabel}>Available</label>
            <input
              type="checkbox"
              checked={profile.available}
              onChange={(e) => {
                const newProfiles = [...profiles];
                newProfiles[index].available = e.target.checked;
                setProfiles(newProfiles);
              }}
              className={styles.checkboxInput}
            />
          </div>

          {[
            { label: "Name", key: "name" },
            { label: "Height (cm)", key: "heightCm" },
            { label: "Weight (kg)", key: "weightKg" },
            { label: "Harness Size", key: "harness_size" },
            { label: "Breed", key: "breed" },
            { label: "Highlights", key: "highlights" },
            { label: "About Me", key: "about_me", multiline: true },
            { label: "Review Link", key: "review_link" },
            { label: "Indoor Services", key: "indoor_services" },
            { label: "Outdoor Services", key: "outdoor_services" },
          ].map((field) => {
            const hasError = validationErrors[profile.id]?.[field.key];
            return (
              <div key={field.key} className={styles.inputRow}>
                <label className={styles.fieldLabel}>{field.label}</label>
                {field.multiline ? (
                  <textarea
                    rows={4}
                    value={profile[field.key] || ""}
                    onChange={(e) => {
                      const newProfiles = [...profiles];
                      newProfiles[index][field.key] = e.target.value;
                      setProfiles(newProfiles);
                    }}
                    className={`${styles.textareaField} ${hasError ? styles.inputError : ""}`}
                  />
                ) : (
                  <input
                    type="text"
                    value={profile[field.key] || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const newProfiles = [...profiles];
                      newProfiles[index][field.key] = value;
                      setProfiles(newProfiles);
                    }}
                    className={`${styles.inputField} ${hasError ? styles.inputError : ""}`}
                  />
                )}
              </div>
            );
          })}

{/* Profile Thumbnail Upload */}
<div className={styles.inputRow}>
  <label className={styles.fieldLabel}>Profile Thumbnail</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      if (!file) return;

      const cleanedName = cleanFileName(file.name);
      const sanitizedFile = new File([file], cleanedName, {
        type: file.type,
      });

      const updated = { ...pendingUploads };
      updated[profile.id] = {
        ...(updated[profile.id] || {}),
        profileThumbnail: sanitizedFile,
      };
      setPendingUploads(updated);
    }}
  />
</div>

{pendingUploads[profile.id]?.profileThumbnail && (
  <div className={`${styles.previewItem} ${styles.pendingUpload}`}>
    <img
      src={URL.createObjectURL(pendingUploads[profile.id].profileThumbnail)}
      alt="Pending Thumbnail"
      className={`${styles.previewImage} ${styles.pendingImage}`}
    />
    <span
      className={styles.deleteIcon}
      title="Cancel thumbnail"
      onClick={() => {
        const updated = { ...pendingUploads };
        delete updated[profile.id]?.profileThumbnail;
        setPendingUploads(updated);
      }}
    >
      ❌
    </span>
  </div>
)}

{/* Profile Full Image Upload */}
<div className={styles.inputRow}>
  <label className={styles.fieldLabel}>Profile Full Image</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      if (!file) return;

      const cleanedName = cleanFileName(file.name);
      const sanitizedFile = new File([file], cleanedName, {
        type: file.type,
      });

      const updated = { ...pendingUploads };
      updated[profile.id] = {
        ...(updated[profile.id] || {}),
        profileFullImage: sanitizedFile,
      };
      setPendingUploads(updated);
    }}
  />
</div>

{pendingUploads[profile.id]?.profileFullImage && (
  <div className={`${styles.previewItem} ${styles.pendingUpload}`}>
    <img
      src={URL.createObjectURL(pendingUploads[profile.id].profileFullImage)}
      alt="Pending Full Image"
      className={`${styles.previewImage} ${styles.pendingImage}`}
    />
    <span
      className={styles.deleteIcon}
      title="Cancel full image"
      onClick={() => {
        const updated = { ...pendingUploads };
        delete updated[profile.id]?.profileFullImage;
        setPendingUploads(updated);
      }}
    >
      ❌
    </span>
  </div>
)}

{/* Gallery Images Upload */}
<div className={styles.inputRow}>
  <label className={styles.fieldLabel}>Gallery Images</label>
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
      const files = Array.from(e.target.files);
      const cleanedFiles = files.map((file) => {
        const cleanedName = cleanFileName(file.name);
        return new File([file], cleanedName, {
          type: file.type,
        });
      });

      const updated = { ...pendingUploads };
      updated[profile.id] = {
        ...(updated[profile.id] || {}),
        gallery: cleanedFiles,
      };
      setPendingUploads(updated);
    }}
  />
</div>

{/* Pending Gallery Uploads */}
<div className={styles.pendingGalleryRow}>
  {pendingUploads[profile.id]?.gallery?.map((file, i) => (
    <div
      key={`pending-gallery-${i}`}
      className={[styles.previewItem, styles.pendingUpload].join(" ")}
    >
      <img
        src={URL.createObjectURL(file)}
        alt={`Pending Gallery ${i + 1}`}
        className={[styles.previewImage, styles.pendingImage].join(" ")}
      />
      <span
        className={styles.deleteIcon}
        title="Cancel gallery image"
        onClick={() => {
          const updated = { ...pendingUploads };
          updated[profile.id].gallery = updated[profile.id].gallery.filter((f) => f !== file);
          setPendingUploads(updated);
        }}
      >
        ❌
      </span>
    </div>
  ))}
</div>

{/* Special Gallery Description */}
<div className={styles.inputRow}>
  <label className={styles.fieldLabel}>Special Gallery Text</label>
  <input
    type="text"
    value={profile.special_gallery?.description || ""}
    onChange={(e) => {
      const newProfiles = [...profiles];
      newProfiles[index].special_gallery.description = e.target.value;
      setProfiles(newProfiles);
    }}
    className={styles.inputField}
  />
</div>

{/* Special Gallery Images Upload */}
<div className={styles.inputRow}>
  <label className={styles.fieldLabel}>Special Gallery Images</label>
  <input
    type="file"
    accept="image/*,video/*"
    multiple
    onChange={(e) => {
      const files = Array.from(e.target.files);
      const cleanedFiles = files.map((file) => {
        const cleanedName = cleanFileName(file.name);
        return new File([file], cleanedName, {
          type: file.type,
        });
      });

      const updated = { ...pendingUploads };
      updated[profile.id] = {
        ...(updated[profile.id] || {}),
        special_gallery: cleanedFiles,
      };
      setPendingUploads(updated);
    }}
  />
</div>

{/* Pending Special Gallery Uploads */}
<div className={styles.pendingSpecialRow}>
  {pendingUploads[profile.id]?.special_gallery?.map((file, i) => (
    <div
      key={`pending-special-${i}`}
      className={[styles.previewItem, styles.pendingUpload].join(" ")}
    >
      {file.type.startsWith("image/") ? (
        <img
          src={URL.createObjectURL(file)}
          alt={`Pending Special ${i + 1}`}
          className={[styles.previewImage, styles.pendingImage].join(" ")}
        />
      ) : (
        <video
          src={URL.createObjectURL(file)}
          className={[styles.previewImage, styles.pendingImage].join(" ")}
          muted
          playsInline
          preload="metadata"
          onMouseOver={(e) => e.target.play()}
          onMouseOut={(e) => e.target.pause()}
        />
      )}
      <span
        className={styles.deleteIcon}
        title="Cancel special gallery item"
        onClick={() => {
          const updated = { ...pendingUploads };
          updated[profile.id].special_gallery = updated[profile.id].special_gallery.filter((f) => f !== file);
          setPendingUploads(updated);
        }}
      >
        ❌
      </span>
    </div>
  ))}
</div>


{/* Saved Thumbnail and Full Image Preview */}
{(profile.profileThumbnail || profile.profileFullImage) && (
  <div className={`${styles.previewRow} ${styles.previewDuo}`}>
    {profile.profileThumbnail && (
      <div className={styles.previewItem}>
        <strong>Profile Thumbnail:</strong>
        {(() => {
          const isMarked = imagesToDelete[profile.id]?.profileThumbnail;
          return (
            <>
              <img
                src={`/images/${profile.id}/${profile.profileThumbnail}`}
                alt="Thumbnail"
                className={`${styles.previewImage} ${isMarked ? styles.markedForDeletion : ""}`}
              />
              <span
                className={styles.deleteIcon}
                onClick={() => {
                  const updated = { ...imagesToDelete };
                  if (!updated[profile.id]) updated[profile.id] = {};
                  updated[profile.id].profileThumbnail = !isMarked;
                  setImagesToDelete(updated);
                }}
              >
                {isMarked ? "↩️" : "❌"}
              </span>
            </>
          );
        })()}
      </div>
    )}

    {profile.profileFullImage && (
      <div className={styles.previewItem}>
        <strong>Profile Full Image:</strong>
        {(() => {
          const isMarked = imagesToDelete[profile.id]?.profileFullImage;
          return (
            <>
              <img
                src={`/images/${profile.id}/${profile.profileFullImage}`}
                alt="Full Image"
                className={`${styles.previewImage} ${isMarked ? styles.markedForDeletion : ""}`}
              />
              <span
                className={styles.deleteIcon}
                onClick={() => {
                  const updated = { ...imagesToDelete };
                  if (!updated[profile.id]) updated[profile.id] = {};
                  updated[profile.id].profileFullImage = !isMarked;
                  setImagesToDelete(updated);
                }}
              >
                {isMarked ? "↩️" : "❌"}
              </span>
            </>
          );
        })()}
      </div>
    )}
  </div>
)}

{/* Saved Gallery Preview */}
<strong>Gallery:</strong>
<div className={styles.previewGallery}>
  {profile.gallery.map((file, i) => {
    const filePath = `/images/${profile.id}/${file}`;
    const isImage = /\.(jpe?g|png|gif)$/i.test(file);
    const isVideo = /\.(mp4|mov|webm)$/i.test(file);
    const isMarked = imagesToDelete[profile.id]?.gallery?.includes(file);

    return (
      <div key={i} className={styles.previewItem}>
        {isImage ? (
          <img
            src={filePath}
            alt={`Gallery ${i + 1}`}
            className={`${styles.previewImage} ${isMarked ? styles.markedForDeletion : ""}`}
          />
        ) : isVideo ? (
          <video
            src={filePath}
            className={`${styles.previewImage} ${isMarked ? styles.markedForDeletion : ""}`}
            muted
            playsInline
            preload="metadata"
            onMouseOver={(e) => e.target.play()}
            onMouseOut={(e) => e.target.pause()}
          />
        ) : (
          <span>{file}</span>
        )}
        <span
          className={styles.deleteIcon}
          onClick={() => {
            const updated = { ...imagesToDelete };
            const currentGallery = updated[profile.id]?.gallery || [];
            const isAlreadyMarked = currentGallery.includes(file);

            updated[profile.id] = {
              ...updated[profile.id],
              gallery: isAlreadyMarked
                ? currentGallery.filter((f) => f !== file)
                : [...currentGallery, file],
            };

            setImagesToDelete(updated);
          }}
        >
          {isMarked ? "↩️" : "❌"}
        </span>
      </div>
    );
  })}
</div>

{/* Saved Special Gallery Preview */}
<strong>Special Gallery:</strong>
<div className={styles.previewGallery}>
  {profile.special_gallery?.gallery?.map((file, i) => {
    const filePath = `/images/${profile.id}/${file}`;
    const isImage = /\.(jpe?g|png|gif)$/i.test(file);
    const isVideo = /\.(mp4|mov|webm)$/i.test(file);
    const isMarked = imagesToDelete[profile.id]?.special_gallery?.includes(file);

    return (
      <div key={i} className={styles.previewItem}>
        {isImage ? (
          <img
            src={filePath}
            alt={`Special ${i + 1}`}
            className={`${styles.previewImage} ${isMarked ? styles.markedForDeletion : ""}`}
          />
        ) : isVideo ? (
          <video
            src={filePath}
            className={`${styles.previewImage} ${isMarked ? styles.markedForDeletion : ""}`}
            muted
            playsInline
            preload="metadata"
            onMouseOver={(e) => e.target.play()}
            onMouseOut={(e) => e.target.pause()}
          />
        ) : (
          <span>{file}</span>
        )}
        <span
          className={styles.deleteIcon}
          onClick={() => {
            const updated = { ...imagesToDelete };
            const currentSpecial = updated[profile.id]?.special_gallery || [];
            const isAlreadyMarked = currentSpecial.includes(file);

            updated[profile.id] = {
              ...updated[profile.id],
              special_gallery: isAlreadyMarked
                ? currentSpecial.filter((f) => f !== file)
                : [...currentSpecial, file],
            };

            setImagesToDelete(updated);
          }}
        >
          {isMarked ? "↩️" : "❌"}
        </span>
      </div>
    );
  })}
</div>

{/* Save Button and Status Message */}
<div className={styles.saveRow}>
  <button
    className={styles.button}
    onClick={() => handleSaveProfile(index)()}
    disabled={savingProfiles}
  >
    {savingProfiles ? "Saving..." : "Save Changes"}
  </button>
</div>

{profile.__status && (
  <div className={styles.saveFeedback}>{profile.__status}</div>
)}

              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;
