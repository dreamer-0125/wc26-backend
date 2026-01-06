import { motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import { Icon } from "@iconify/react";

const WhyChooseSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      title: t("Secure & Reliable"),
      description: t(
        "Bank-level security with multi-layer encryption and cold storage for your assets. Your funds are protected 24/7."
      ),
      icon: "mdi:shield-check",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: t("World Cup 2026 Trading"),
      description: t(
        "Trade on FIFA World Cup 2026 matches with real-time odds and live updates. Experience the excitement of sports trading."
      ),
      icon: "mdi:soccer",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: t("Low Trading Fees"),
      description: t(
        "Competitive fee structure with transparent pricing. Start trading with minimal costs and maximize your profits."
      ),
      icon: "mdi:currency-usd",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: t("24/7 Support"),
      description: t(
        "Round-the-clock customer support team ready to assist you with any questions or issues. We're here when you need us."
      ),
      icon: "mdi:headset",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: t("Fast Execution"),
      description: t(
        "Lightning-fast order execution with advanced matching engine. Trade instantly without delays or slippage."
      ),
      icon: "mdi:lightning-bolt",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      title: t("Global Access"),
      description: t(
        "Trade from anywhere in the world. Access your account and manage your portfolio on any device, anytime."
      ),
      icon: "mdi:earth",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
  ];

  return (
    <section className="w-full px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto dark:bg-black bg-white dark:bg-dot-white/[0.1] bg-dot-black/[0.1] relative">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_70%,black)]"></div>

      <div className="max-w-7xl relative pt-6 lg:pt-0 px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-muted-800 dark:text-muted-100 mb-4">
            {t("Why Choose WC26 Exchange")}
          </h2>
          <p className="text-lg text-muted-600 dark:text-muted-400 max-w-2xl mx-auto">
            {t(
              "Experience the future of trading with cutting-edge technology, unmatched security, and exclusive World Cup 2026 trading opportunities."
            )}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative p-6 lg:p-8 rounded-xl border border-muted-200 dark:border-muted-800 bg-white dark:bg-muted-900 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.6, -0.05, 0.01, 0.99],
              }}
            >
              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon
                  icon={feature.icon}
                  className={`w-6 h-6 ${feature.color}`}
                />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-muted-800 dark:text-muted-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-600 dark:text-muted-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative Element */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                <Icon
                  icon={feature.icon}
                  className={`w-full h-full ${feature.color}`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          className="mt-12 lg:mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <Icon
              icon="mdi:trophy"
              className="w-5 h-5 text-primary-600 dark:text-primary-400"
            />
            <span className="text-primary-700 dark:text-primary-300 font-medium">
              {t("Join thousands of traders already using WC26 Exchange")}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseSection;

