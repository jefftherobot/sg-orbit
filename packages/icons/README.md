# @orbit-ui/icons

## Usage

As a React component:

```javascript
import { ClearIcon } from "@orbit-ui/icons";
<ClearIcon />;
```

As a React file:

```javascript
import clearIcon from "@orbit-ui/icons/icon-clear.svg";
<img src={clearIcon} />;
```

As a CSS background file:

```css
.clear-icon: {
    background: url("~@orbit-ui/icons/icon-clear.svg");
}
```

## Maintainers

The following documentation is only for the maintainers of this repository.

### Icons Guidelines

In order to be included in Orbit UI an icon must satisfy the following guidelines

-   It should not be specific to an app, e.g. Azure specific icons. <img src="https://raw.githubusercontent.com/gsoft-inc/sg-brand/master/packages/icons/assets/app-specific-icon.png" width="27">

-   It must be used as part of an interface, illustrations and product icons should'nt be submitted to this library.

-   It should'nt be coloured, any icon that has many colours should be in your codebase.

-   When an icon is used in a monorepo component it should live in this project.

### Naming convention

-   An icon name should describe it's look and not usage. (e.g. _trash_.svg instead of ~~delete.svg~~)

-   An icon should be appended by it's numeric size when an hardcoded dimension (e.g. trash-_32x32_.svg)

-   If an icon represents a specific state add it to the file name (e.g. trash-_empty_-32x32.svg)

-   Although not ideal when an svg has to be coloured add the colour name(refer to sg-brand colour names) after it's name and before it's size (e.g. trash-empty-_cloud-300_-24x24.svg)

### Additional usage

If you add an icon as a CSS background to a package of the monorepo, you must add the `/dist` segment to the path.

```css
.clear-icon: {
    background: url("~@orbit-ui/icons/dist/icon-clear.svg");
}
```