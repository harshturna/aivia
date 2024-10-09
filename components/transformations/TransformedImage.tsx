import { dataUrl, debounce, getImageSize } from "@/lib/utils";
import { Download, Loader2 } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import toast from "react-hot-toast";

const TransformedImage = ({
  image,
  type,
  transformationConfig,
  isTransforming,
  setIsTransforming,
  hasDownload = false,
}: TransformedImageProps) => {
  const downloadHandler = () => {};

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-between">
        <h3 className="h3-bold text-dark-600">Transformed</h3>

        {hasDownload && (
          <button className="download-btn" onClick={downloadHandler}>
            <Download width={28} height={28} className="pb-[6px]" />
          </button>
        )}
      </div>
      {image?.publicId && transformationConfig ? (
        <div className="relative">
          <CldImage
            width={getImageSize(type, image, "width")}
            height={getImageSize(type, image, "height")}
            src={image?.publicId}
            alt={image.title || "Transformed Image"}
            sizes={"(max-width: 767px) 100vw 50vw"}
            placeholder={dataUrl as PlaceholderValue}
            className="transformed-image"
            onLoad={() => {
              setIsTransforming && setIsTransforming(false);
            }}
            onError={() => {
              toast.error("Something went wrong, please try again");
              debounce(() => {
                setIsTransforming && setIsTransforming(false);
              }, 8000);
            }}
            {...transformationConfig}
          />
          {isTransforming && <div className="transforming-loader"></div>}
        </div>
      ) : (
        <div className="transformed-placeholder">Transformed image</div>
      )}
    </div>
  );
};

export default TransformedImage;
