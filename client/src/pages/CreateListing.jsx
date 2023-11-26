import { useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";

export default function CreateListing() {

    // State for selected image files and form data
    const [ files, setFiles ] = useState([]);
    const [ formData, setFormData ] = useState({
        imageUrls: [],
    });
    // State to manage image upload errors
    const [ imageUploadError, setImageUploadError ] = useState(false);
    // State for loading effect during image upload
    const [ uploading, setUploading ] = useState(false);

    
    console.log(formData);
    console.log(imageUploadError);
    // Function to handle image submission
    const handleImageSubmit = e => {
        // images should be greater than zero but less than 7
        if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
            setUploading(true);
            setImageUploadError(false);
            const promises = [];

            // Loop through selected files and initiate image upload
            for (let i = 0 ; i < files.length; i++) {
                promises.push(storeImage(files[i]));
            }
            
            // Wait for all image uploads to complete
            Promise.all(promises).then(urls => {
                // Update form data with new image URLs
                setFormData({ ...formData, imageUrls: formData.imageUrls.concat(urls) });
                // Reset image upload error state
                setImageUploadError(false);
                setUploading(false);
            }).catch(err => {
                // Handle image upload failure
                setImageUploadError('Image upload failed (2 mb max per image)');
                setUploading(false);
            })  
        } else {
            // Handle error when trying to upload more than 6 images
            setImageUploadError('You can only upload 6 images per listing');
            setUploading(false);
        }
       
    };

    // Function to store an individual image
    const storeImage = async(file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const fileName = new Date().getTime() + file.name;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);

            // Track upload progress, handle errors, and resolve on successful upload
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`)
                },
                (error) => {
                    // Reject the promise if an error occurs during upload
                    reject(error);
                },
                ()=>{
                    // Once upload is complete, get the download URL and resolve the promise
                    getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
                        resolve(downloadURL);
                    });
                }
            )
        })
    }

    // Function to handle image removal based on index
    const handleRemoveImage = index => {
        setFormData({
            ...formData,
            imageUrls: formData.imageUrls.filter((_, i) => i !== index),
        })
    }

    return (
        <main className='p-3 max-w-4xl mx-auto'>
            <h1 className='text-3xl font-semibold text-center my-7'>Create a Listing</h1>
            <form className='flex flex-col sm:flex-row gap-4' action="">
                <div className='flex flex-col gap-4 flex-1'>
                    <input type="text" placeholder='Name' className='border p-3 rounded-lg' id='name' maxLength='62' minLength='10' required/>
                    <textarea type="text" placeholder='Description' className='border p-3 rounded-lg' id='description' maxLength='62' minLength='10' required/>
                    <input type="text" placeholder='Address' className='border p-3 rounded-lg' id='address' required/>
                
                    {/* flex wrap for bringing some items down on smaller screens */}
                    <div className='flex  gap-6 flex-wrap'>
                        <div className='flex gap-2'>
                            <input type="checkbox" id='sale' className='w-5' />
                            <span>Sell</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type="checkbox" id='sarentrele' className='w-5' />
                            <span>Rent</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type="checkbox" id='parking' className='w-5' />
                            <span>Parking spot</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type="checkbox" id='furnished' className='w-5' />
                            <span>Furnished</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type="checkbox" id='offer' className='w-5' />
                            <span>Offer</span>
                        </div>
                    </div>
                    <div className='flex flex-wrap gap-6'>
                        <div className='flex items-center gap-2'>
                            <input type="number" id='bedrooms' min='1' max='10' required className='p-3 border border-gray-300 rounded-lg' />
                            <p>Beds</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <input type="number" id='bathrooms' min='1' max='10' required className='p-3 border border-gray-300 rounded-lg' />
                            <p>Baths</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <input type="number" id='regularPrice' min='1' max='10' required className='p-3 border border-gray-300 rounded-lg' />
                            <div className='flex flex-col items-center'>
                                <p>Regular Price</p>
                                <span className='text-xs'>($ / month)</span>
                            </div>   
                        </div>
                        <div className='flex items-center gap-2'>
                            <input type="number" id='discountPrice' min='1' max='10' required className='p-3 border border-gray-300 rounded-lg' />
                            <div className='flex flex-col items-center'>
                                <p>Discounted Price</p>
                                <span className='text-xs'>($ / month)</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col flex-1 gap-4'>
                    <p className='font-semibold'>Images:
                    <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 6)</span>
                    </p>
                    <div className="flex gap-4">
                        <input onChange={(e) => setFiles(e.target.files)} className='p-3 border border-gray-300 rounded w-full' type="file" id='images' accept='image/*' multiple />
                        {/* put button as type to avoid submitting the whole form */}
                        <button 
                            type="button" 
                            onClick={handleImageSubmit} 
                            className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                    <p className="text-red-700 text-sm">{ imageUploadError && imageUploadError }</p>

                    {/* Display images and delete buttons for each uploaded image */}
                    {
                        formData.imageUrls.length > 0 && formData.imageUrls.map((url, index) => (
                            <div className="flex justify-between p-3 border items-center" key={index}>
                                <img src={url} alt="listing image" className="w-20 h-20 object-contain rounded-lg" />
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveImage(index)} 
                                    className="p-3 text-red-700 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
                                >
                                    Delete
                                </button>
                            </div>
                        ))  
                    }
                    
                    <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>Create Listing</button>
                </div>
            </form>
        </main>
  )
}
