import styled from 'styled-components';
const pxRe = /-?\d*[.\d]*px/g;
const base64Re = /^data:\w+\/[a-zA-Z+\-.]+;base64,/i

const px2rem = px => Number(px) ? `${Math.round(Number(px) / 100 * 100000) / 100000}rem` : 0;

const convertStringPx2rem = style => {
    if (!style) return style;

    if (
        !base64Re.test(style) // 非base64字符串
        && pxRe.test(style)     // 包含px单位
    ) {
        return style.replace(pxRe, value => px2rem(value.replace('px', '')))
    }

    return style;
}

const convertInterpolationPx2rem = interpolation => {
    if (Object.prototype.toString.call(interpolation) === '[object Object]'
        && interpolation.constructor.name.toLowerCase() === 'keyframes') {

        interpolation.rules = interpolation.rules.map(convertStringPx2rem);
        return interpolation;
    } else if (typeof interpolation !== 'function') return interpolation;

    return props => {
        const result = interpolation(props);


        if (typeof result === 'string') {
            return convertStringPx2rem(result);
        }

        if (Array.isArray(result)) {
            return result.map(convertStringPx2rem);
        }
        return result;
    };
};

const withCss = styled => {
    const interleave = (strings, ...interpolations) => {

        strings = strings.map(convertStringPx2rem);

        interpolations = interpolations.map(convertInterpolationPx2rem);


        return styled(strings, ...interpolations);
        // return styled(strings, ...interpolations);
    }

    Object.keys(styled).forEach(prop => interleave[prop] = withTemplateFunc(styled[prop]));

    return interleave;
};
const withTemplateFunc = styled => (...props) => withCss(styled(...props));

const styledPx2rem = ((styled) => {
    const obj = withTemplateFunc(styled);

    Object.keys(styled).forEach(key => {
        obj[key] = withCss(styled[key]);

        Object.keys(styled[key]).forEach(prop => obj[key][prop] = withTemplateFunc(styled[key][prop]));
    });

    return obj;
})(styled);

export default styledPx2rem;
export { px2rem };


export * from 'styled-components';

