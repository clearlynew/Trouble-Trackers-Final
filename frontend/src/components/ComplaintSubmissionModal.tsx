import React, {
  useState,
} from 'react';

import {
  X,
  Plus,
  Loader2,
} from 'lucide-react';

import { submitComplaint } from '../services/complaintService';

interface ComplaintSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComplaintSubmissionModal: React.FC<
  ComplaintSubmissionModalProps
> = ({
  isOpen,
  onClose,
}) => {
  const [title, setTitle] =
    useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  const [domain, setDomain] =
    useState('');

  const [
    imageFiles,
    setImageFiles,
  ] = useState<File[]>([]);

  const [
    imagePreviews,
    setImagePreviews,
  ] = useState<string[]>([]);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const domains = [
    'Maintenance',
    'Cleanliness',
    'Food',
    'Internet',
    'Security',
  ];

  const resetFormAndClose =
    () => {
      setTitle('');
      setDescription('');
      setDomain('');
      setImageFiles([]);
      setImagePreviews([]);
      setError(null);
      setIsLoading(false);
      onClose();
    };

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();
      setError(null);

      // 📡 Diagnostic Logs
      console.log("🚀 Submit button clicked!");
      console.log("📊 Total files sitting in React State right now:", imageFiles.length);

      if (
        !title.trim() ||
        !description.trim() ||
        !domain
      ) {
        setError(
          'Please fill in all required fields.'
        );
        return;
      }

      setIsLoading(true);

      try {
        let uploadedImageUrls: any[] = [];

        // image upload handler
        if (imageFiles.length > 0) {
          console.log("📡 State confirm: Files detected! Dispatching API upload payload...");
          const formData = new FormData();

          imageFiles.forEach(
            (file) =>
              formData.append(
                'images',
                file
              )
          );

          const token =
            localStorage.getItem(
              'token'
            );

          if (!token) {
            throw new Error(
              'Authentication token missing.'
            );
          }

          const uploadResponse =
            await fetch(
              'http://localhost:5000/api/images/upload-images',
              {
                method:
                  'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              }
            );

          if (
            !uploadResponse.ok
          ) {
            const errorData =
              await uploadResponse
                .json()
                .catch(() => ({
                  message:
                    'Image upload failed.',
                }));

            throw new Error(
              errorData.message ||
                'Image upload failed. Please try again.'
            );
          }

          const data = await uploadResponse.json();
          console.log("✅ Server Upload Response Payload Received:", data);

          // Standardize payload extraction based on whether backend returns filePaths or objects
          uploadedImageUrls = data.filePaths || data.images || data;
        } else {
          console.warn("⚠️ Warning: imageFiles array was empty. Skipping image upload step.");
        }

        // complaint submission payload
        await submitComplaint({
          title,
          description,
          domain,
          images: uploadedImageUrls,
        });

        // success cleanup
        resetFormAndClose();
        alert(
          'Complaint submitted successfully!'
        );
      } catch (err: any) {
        const errorMessage =
          err.message ||
          'An unexpected error occurred during submission.';

        setError(errorMessage);
        console.error('Submission Error Details:', err);
      } finally {
        setIsLoading(false);
      }
    };

  const handleImageUpload =
    (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      setError(null);
      const files = e.target.files;
      if (!files) return;

      const currentFilesCount = imageFiles.length;
      const filesArray = Array.from(files).slice(
        0,
        5 - currentFilesCount
      );

      if (
        currentFilesCount +
          filesArray.length >
        5
      ) {
        setError(
          `You can only upload a maximum of 5 images. Already have ${currentFilesCount}.`
        );
        return;
      }

      // Batch create Object previews cleanly in one single batch pass
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));

      setImageFiles((prev) => [...prev, ...filesArray]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);

      // reset file input value stream
      e.target.value = '';
    };

  const removeImage = (
    index: number
  ) => {
    setImageFiles(
      imageFiles.filter(
        (_, i) =>
          i !== index
      )
    );

    setImagePreviews(
      imagePreviews.filter(
        (_, i) =>
          i !== index
      )
    );
  };

  if (!isOpen)
    return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Submit New Complaint
          </h2>

          <button
            onClick={
              onClose
            }
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={
              isLoading
            }
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="p-6 space-y-6"
        >
          {/* title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Complaint Title *
            </label>

            <input
              type="text"
              id="title"
              value={title}
              onChange={(
                e
              ) =>
                setTitle(
                  e.target
                    .value
                )
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="Brief description of the issue"
              required
              disabled={
                isLoading
              }
            />
          </div>

          {/* domain */}
          <div>
            <label
              htmlFor="domain"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Domain *
            </label>

            <select
              id="domain"
              value={domain}
              onChange={(
                e
              ) =>
                setDomain(
                  e.target
                    .value
                )
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              required
              disabled={
                isLoading
              }
            >
              <option value="">
                Select a domain
              </option>

              {domains.map(
                (d) => (
                  <option
                    key={d}
                    value={d}
                  >
                    {d}
                  </option>
                )
              )}
            </select>
          </div>

          {/* description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Detailed Description *
            </label>

            <textarea
              id="description"
              value={
                description
              }
              onChange={(
                e
              ) =>
                setDescription(
                  e.target
                    .value
                )
              }
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
              placeholder="Provide detailed information about the issue..."
              required
              disabled={
                isLoading
              }
            />
          </div>

          {/* images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Images (Optional)
            </label>

            {error && (
              <div className="p-3 mb-4 text-sm font-medium text-red-700 bg-red-100 rounded-lg">
                ⚠️ Error:{' '}
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {imagePreviews.map(
                (
                  src,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className="relative group"
                  >
                    <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={
                          src
                        }
                        alt={`preview-${index}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(
                          index
                        )
                      }
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-100 transition-opacity disabled:opacity-50"
                      disabled={
                        isLoading
                      }
                    >
                      <X className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                )
              )}

              {imagePreviews.length <
                5 && (
                <label
                  className={`w-full h-24 rounded-lg flex items-center justify-center transition-colors border-2 border-dashed border-gray-300 cursor-pointer ${
                    isLoading
                      ? 'bg-gray-200 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Plus className="w-6 h-6 text-gray-400" />

                  <input
                    type="file"
                    accept="image/*"
                    style={{
                      display:
                        'none',
                    }}
                    onChange={
                      handleImageUpload
                    }
                    multiple
                    disabled={
                      isLoading
                    }
                  />
                </label>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-2">
              You can attach up to 5 images.
            </p>
          </div>

          {/* buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={
                onClose
              }
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={
                isLoading
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
              disabled={
                isLoading
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Complaint'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintSubmissionModal;