import { createEtradeGLFilter } from "@/lib/etrade/parse-etrade-gl";

export const isFrQualifiedSo = createEtradeGLFilter({
  planType: "SO",
  qualifiedIn: "fr",
});
export const isUsQualifiedSo = createEtradeGLFilter({
  planType: "SO",
  qualifiedIn: "us",
});

export const isEspp = createEtradeGLFilter({
  planType: "ESPP",
});

export const isFrQualifiedRsu = createEtradeGLFilter({
  planType: "RS",
  qualifiedIn: "fr",
});
export const isUsQualifiedRsu = createEtradeGLFilter({
  planType: "RS",
  qualifiedIn: "us",
});
