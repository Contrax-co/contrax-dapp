import { weight, family } from "./fonts";

const baseStyles = (fontSize, fontWeight, lineHeight) => ({
    fontSize,
    fontWeight,
    lineHeight,
});

export const PageTitle = {
    ...baseStyles("4rem", weight.semibold, "4.5rem"),
    fontFamily: family.Lexend,
};

export const PageSubTitle = {
    ...baseStyles("2.5rem", weight.regular, "3rem"),
    fontFamily: family.Lexend,
};

export const Title = {
    ...baseStyles("1.5rem", weight.light, "2rem"),
    fontFamily: family.Lexend,
};

export const Desc = {
    ...baseStyles("1rem", weight.light, "1.5rem"),
    fontFamily: family.Poppins,
};

export const BtnText = {
    ...baseStyles("1rem", weight.regular, "1.5rem"),
    fontFamily: family.Poppins,
};

// New design
export const H1 = {
    ...baseStyles("3rem", weight.regular, "3.5rem"),
    fontFamily: family.Lexend,
};

export const H2 = {
    ...baseStyles("2rem", weight.regular, "2.5rem"),
    fontFamily: family.Lexend,
};

export const H3 = {
    ...baseStyles("1.5rem", weight.regular, "2rem"),
    fontFamily: family.Lexend,
};

export const B1 = {
    ...baseStyles("1rem", weight.regular, "1.5rem"),
    fontFamily: family.Poppins,
};

export const TextBtn = {
    ...baseStyles("1rem", weight.semibold, "1.5rem"),
    fontFamily: family.Poppins,
};

export const caption = {
    ...baseStyles("0.75rem", weight.regular, "1.25rem"),
    fontFamily: family.Poppins,
};
