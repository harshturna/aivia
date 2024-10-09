"use client";

import { dataUrl, getImageSize } from "@/lib/utils";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import { CldImage, CldUploadWidget } from "next-cloudinary";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

type MediaUploadProps = {
  onValueChange: (value: string) => void;
  setImage: React.Dispatch<any>;
  image: string;
  publicId: string;
  type: string;
};

const MediaUploader = ({
  onValueChange,
  setImage,
  image,
  publicId,
  type,
}: MediaUploadProps) => {
  const onUploadSuccessHandler = (result: any) => {
    setImage((prevState: any) => ({
      ...prevState,
      publicId: result?.info?.public_id,
      width: result?.info?.width,
      height: result?.info?.height,
      secureURL: result?.info?.secure_url,
    }));

    onValueChange(result?.info?.public_id);

    // toast({
    //   title: "Image uploaded successfully",
    //   description: "A credit was deducted from your account",
    //   duration: 5000,
    //   className: "success-toast",
    // });
  };

  const onUploadErrorHandler = () => {
    toast.error("Something went wrong, please try again");
  };
  return (
    <CldUploadWidget
      uploadPreset="aivia_transformation"
      options={{
        multiple: false,
        resourceType: "image",
      }}
      onSuccess={onUploadSuccessHandler}
      onError={onUploadErrorHandler}
    >
      {({ open }) => (
        <div className="flex flex-col gap-4">
          <h3 className="h3-bold text-dark-600">Original</h3>

          {publicId ? (
            <>
              <div className="cursor-pointer overflow-hidden rounded-[10px]">
                <CldImage
                  width={getImageSize(type, image, "width")}
                  height={getImageSize(type, image, "height")}
                  src={publicId}
                  alt="image"
                  sizes={"(max-width: 767px) 100vw 50vw"}
                  placeholder={dataUrl as PlaceholderValue}
                  className="media-uploader_cldImage"
                />
              </div>
            </>
          ) : (
            <div className="media-uploader_cta" onClick={() => open()}>
              <div className="flex items-center justify-center flex-col gap-2">
                <Plus width={28} height={28} />
                <p className="font-medium">Click here to uploader image</p>
              </div>
            </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
};

export default MediaUploader;
