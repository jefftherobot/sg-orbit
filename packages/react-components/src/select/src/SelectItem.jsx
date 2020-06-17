import { SelectContext } from "./SelectContext";
import { Dropdown as SemanticDropdown } from "semantic-ui-react";
import { arrayOf, element, oneOf, oneOfType, shape, string } from "prop-types";
import { isNil } from "lodash";
import { mergeClasses, throwWhenUnsupportedPropIsProvided } from "../../shared";
import { renderAvatar } from "./renderAvatar";
import { renderIcons } from "./renderIcons";
import { useContext } from "react";

const UNSUPPORTED_PROPS = ["content", "flag", "icon", "image", "label"];

const AVATAR_SHAPE = {
    src: string.isRequired,
    alt: string
};

const propTypes = {
    /**
     * The item text.
     */
    text: string,
    /**
     * The item value.
     */
    value: string,
    /**
     * A description to display with less emphasize.
     */
    description: string,
    /**
     * [Shorthand](/?path=/docs/getting-started-shorthand-props--page) to display an avatar before the text.
     */
    avatar: oneOfType([element, shape(AVATAR_SHAPE)]),
    /**
     * [Shorthand](/?path=/docs/getting-started-shorthand-props--page) for [icons](/?path=/docs/components-icon--default-story).
     */
    icons: oneOfType([element, arrayOf(element)]),
    /**
     * Icons can appear on the left or right of the item content.
     */
    iconsPosition: oneOf(["left", "right"])
};

const defaultProps = {
    iconsPosition: "left"
};

function throwWhenMutuallyExclusivePropsAreProvided({ icons, iconsPosition, avatar }) {
    if (!isNil(icons) && iconsPosition === "left" && !isNil(avatar)) {
        throw new Error("@orbit-ui/react-components/SelectItem doesn't support having a left positioned icons and an avatar at the same time.");
    }
}

export function SelectItem(props) {
    const { text, icons, iconsPosition, avatar, description, className, ...rest } = props;
    const { size } = useContext(SelectContext);

    throwWhenUnsupportedPropIsProvided(props, UNSUPPORTED_PROPS, "@orbit-ui/react-components/SelectItem");
    throwWhenMutuallyExclusivePropsAreProvided(props);

    const iconsMarkup = !isNil(icons) && renderIcons(icons, size);

    const avatarMarkup = !isNil(avatar) && renderAvatar(avatar, size);

    const textMarkup = !isNil(text) && (
        <span className="text">
            {text}
        </span>
    );

    const descriptionMarkup = !isNil(description) && (
        <span className="description">
            {description}
        </span>
    );

    const content = (
        <>
            {iconsPosition === "left" && iconsMarkup}{avatarMarkup}
            {textMarkup}
            {iconsPosition === "right" && iconsMarkup}
            {descriptionMarkup}
        </>
    );

    return (
        <SemanticDropdown.Item
            {...rest}
            className={mergeClasses(
                !isNil(avatar) && "with-avatar",
                !isNil(icons) && iconsPosition === "left" && "with-icons-left",
                !isNil(icons) && iconsPosition === "right" && "with-icons-right",
                className
            )}
        >
            {content}
        </SemanticDropdown.Item>
    );
}

SelectItem.propTypes = propTypes;
SelectItem.defaultProps = defaultProps;

SemanticDropdown.Item.create = props => {
    return <SelectItem {...props} />;
};

// ***** API *****

export function selectItem(text, value, props = {}) {
    return {
        text,
        value,
        key: value,
        ...props
    };
}