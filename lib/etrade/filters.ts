import { createEtradeGLFilter } from "@/lib/etrade/parse-etrade-gl";

export const isQualifiedSo = createEtradeGLFilter({
  planType: "SO",
  isQualified: true,
});
export const isNonQualifiedSo = createEtradeGLFilter({
  planType: "SO",
  isQualified: false,
});

export const isEspp = createEtradeGLFilter({
  planType: "ESPP",
});

export const isQualifiedRsu = createEtradeGLFilter({
  planType: "RS",
  isQualified: true,
});
export const isNonQualifiedRsu = createEtradeGLFilter({
  planType: "RS",
  isQualified: false,
});
