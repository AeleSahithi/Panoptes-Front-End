import React from 'react';
import PropTypes from 'prop-types';
import { socialIcons } from '../../../../lib/nav-helpers';
import { Markdown } from 'markdownz';

export default function ExternalLink({ className, isExternalLink, isSocialLink, label, path, site, url }) {
  let iconClasses;
  let linkLabel = label;
  const linkProps = {
    className,
    href: url,
  };

  if (isExternalLink) {
    iconClasses = 'fa fa-external-link fa-fw';
  }

  if (isSocialLink) {
    const icon = socialIcons[site].icon;
    iconClasses = `fa ${icon} fa-fw`;
    linkLabel = path;
  }

  if (isExternalLink || isSocialLink) {
    return (
      <div className={linkProps.className}>
        <Markdown tag="span" className="link-title" inline={true}>
          {`[${linkLabel}](+tab+${linkProps.href})`}
        </Markdown>
        {iconClasses && <i className={iconClasses} />}
      </div>
    );
  }

  return null;
}

ExternalLink.defaultProps = {
  className: '',
  isExternalLink: false,
  isSocialLink: false,
  label: '',
  path: '',
  site: '',
  url: ''
};

ExternalLink.propTypes = {
  className: PropTypes.string,
  isExternalLink: PropTypes.bool.isRequired,
  isSocialLink: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  path: PropTypes.string,
  site: PropTypes.string,
  url: PropTypes.string.isRequired
};
