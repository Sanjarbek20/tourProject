import { useTranslation } from "react-i18next";

const WhyChooseUs = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-neutral-800 mb-4">
            {t("whyChoose.title")}
          </h2>
          <p className="text-lg text-neutral-800/70 max-w-2xl mx-auto">
            {t("whyChoose.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-map-marked-alt text-2xl text-primary"></i>
            </div>
            <h3 className="text-xl font-heading font-bold mb-3">
              {t("whyChoose.reasons.expertise.title")}
            </h3>
            <p className="text-neutral-800/70">
              {t("whyChoose.reasons.expertise.description")}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-hands-helping text-2xl text-primary"></i>
            </div>
            <h3 className="text-xl font-heading font-bold mb-3">
              {t("whyChoose.reasons.service.title")}
            </h3>
            <p className="text-neutral-800/70">
              {t("whyChoose.reasons.service.description")}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-shield-alt text-2xl text-primary"></i>
            </div>
            <h3 className="text-xl font-heading font-bold mb-3">
              {t("whyChoose.reasons.safety.title")}
            </h3>
            <p className="text-neutral-800/70">
              {t("whyChoose.reasons.safety.description")}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-heart text-2xl text-primary"></i>
            </div>
            <h3 className="text-xl font-heading font-bold mb-3">
              {t("whyChoose.reasons.authentic.title")}
            </h3>
            <p className="text-neutral-800/70">
              {t("whyChoose.reasons.authentic.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
