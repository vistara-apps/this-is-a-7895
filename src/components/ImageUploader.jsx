import React, { useState, useRef } from 'react'
import { Upload, X, Image } from 'lucide-react'

export default function ImageUploader({ onImageUpload }) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      setUploadedImage(file)
      onImageUpload(file)
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    onImageUpload(null)
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      {uploadedImage ? (
        <div className="relative">
          <img
            src={URL.createObjectURL(uploadedImage)}
            alt="Uploaded product"
            className="w-full h-64 object-cover rounded-lg"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="mt-2 text-sm text-text-secondary">
            {uploadedImage.name} ({(uploadedImage.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragActive
              ? 'border-primary bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileSelector}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {dragActive ? (
                <Upload className="w-8 h-8 text-primary" />
              ) : (
                <Image className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {dragActive ? 'Drop your image here' : 'Upload product image'}
            </h3>
            
            <p className="text-text-secondary mb-4">
              Drag and drop your image here, or click to browse
            </p>
            
            <div className="text-sm text-text-secondary">
              Supports: JPG, PNG, GIF up to 10MB
            </div>
          </div>
        </div>
      )}
    </div>
  )
}