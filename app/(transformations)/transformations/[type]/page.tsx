import Header from "@/components/transformations/Header";
import TransformationForm from "@/components/transformations/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";

const AddTransformationPage = async ({
  params: { type },
}: SearchParamProps) => {
  const transformation = transformationTypes[type];

  const user = await getUser("SERVER_COMPONENT");

  if (!user || !user.id) {
    redirect("/login");
  }

  return (
    <div className="pt-2 pb-8 max-w-[1100px] mx-auto px-8 xl:px-4">
      <Header title={transformation.title} subTitle={transformation.subTitle} />
      <section className="mt-10">
        <TransformationForm
          action="Add"
          type={transformation.type as TransformationTypeKey}
        />
      </section>
    </div>
  );
};

export default AddTransformationPage;
