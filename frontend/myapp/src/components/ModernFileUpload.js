import React, { useState } from 'react';
import { FaCloudUploadAlt, FaFileImage } from 'react-icons/fa';

const ModernFileUpload = ({ onChange, label, accept = "image/*", hint = "JPG, PNG or GIF (Max 5MB)" }) => {
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            onChange(e);
        }
    };

    return (
        <div className={`modern-file-upload ${fileName ? 'file-selected' : ''}`}>
            <input
                type="file"
                onChange={handleFileChange}
                accept={accept}
            />
            <div className="modern-file-upload-icon">
                {fileName ? <FaFileImage /> : <FaCloudUploadAlt />}
            </div>
            <div className="modern-file-upload-text">
                {fileName ? (
                    <span className="file-selected-name">{fileName}</span>
                ) : (
                    <span>{label || 'Click or drag to upload'}</span>
                )}
            </div>
            <div className="modern-file-upload-hint">{hint}</div>
        </div>
    );
};

export default ModernFileUpload;
