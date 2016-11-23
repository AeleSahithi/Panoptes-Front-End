import React, { Component } from 'react';
import apiClient from 'panoptes-client/lib/api-client';
import talkClient from 'panoptes-client/lib/talk-client';
import { Link } from 'react-router';
import Notification from './notification';
import Paginator from '../../talk/lib/paginator';
import updateQueryParams from '../../talk/lib/update-query-params';
import ZooniverseLogo from '../../partials/zooniverse-logo';

class NotificationSection extends Component {
  constructor(props) {
    super(props);
    this.onSectionToggle = this.onSectionToggle.bind(this);
    this.state = {
      currentMeta: { },
      error: null,
      firstMeta: { },
      lastMeta: { },
      notificationsMap: { },
      notifications: [],
      page: 1,
    };
  }

  componentWillMount() {
    if (this.props.section === 'zooniverse') {
      this.setState({
        name: 'Zooniverse',
      });
    } else {
      apiClient.type('projects').get({ id: this.props.projectID, cards: true })
      .catch((error) => {
        this.setState({ error });
      })
      .then(([project]) => {
        return this.setState({
          name: project.display_name,
          avatar: project.avatar_src,
        });
      });
    }
  }

  componentDidMount() {
    this.getUnreadCount();
  }

  componentWillReceiveProps(nextProps) {
    const pageChanged = nextProps.location.query.page !== this.state.page;
    const userChanged = nextProps.user && nextProps.user !== this.props.user;
    if ((pageChanged || userChanged) && nextProps.expanded) {
      this.getNotifications(nextProps.location.query.page);
    }
  }

  componentWillUnmount() {
    if (this.props.user) {
      this.markAsRead('first');
      this.markAsRead('last');
    }
  }

  onSectionToggle() {
    const expandToggle = this.props.expanded ? false : this.props.section;
    updateQueryParams(this.context.router, { page: 1 });
    this.props.callbackParent(expandToggle);
  }

  getNotifications(page) {
    let firstMeta;
    let lastMeta;
    return talkClient.type('notifications').get({ page, page_size: 5, section: this.props.section })
      .then((newNotifications) => {
        const meta = newNotifications[0] ? newNotifications[0].getMeta() : { };
        const notificationsMap = this.state.notificationsMap;
        firstMeta = this.state.firstMeta;
        lastMeta = this.state.lastMeta;

        meta.notificationIds = [];
        newNotifications.forEach((notification, i) => {
          notificationsMap[notification.id] = notification;
          meta.notificationIds.push(newNotifications[i].id);
        });

        if (meta.page > this.state.lastMeta.page) {
          lastMeta = meta;
        } else if (meta.page < this.state.firstMeta.page) {
          firstMeta = meta;
        } else {
          firstMeta = lastMeta = meta;
        }

        this.setState({
          notifications: newNotifications,
          currentMeta: meta,
          firstMeta,
          lastMeta,
          notificationsMap,
          page,
        });
        this.getUnreadCount();
      });
  }

  getUnreadCount() {
    return talkClient.type('notifications').get({ page: 1, page_size: 1, delivered: false, section: this.props.section })
    .catch((error) => {
      this.setState({ error });
    })
    .then(([project]) => {
      if (project) {
        const count = project.getMeta().count || 0;
        this.setState({ unread: count });
      } else {
        this.setState({ unread: 0 });
      }
    });
  }

  markAsRead(position) {
    const ids = this.state[`${position}Meta`].notificationIds;
    const unread = [];

    if (ids !== undefined) {
      ids.forEach((id) => {
        if (!this.state.notificationsMap[id].delivered) unread.push(id);
      });

      if (unread.length === 0) return unread;

      this.state.notifications.forEach((notification) => {
        if (unread.indexOf(notification.id) > -1) {
          notification.update({ delivered: true }).save();
        }
      });
    }
  }

  avatarFor() {
    const src = this.state.avatar ? `//${this.state.avatar}` : '/assets/simple-avatar.jpg';
    let avatar;

    if (this.state.unread > 0) return this.unreadCircle();

    if (this.state.name === 'Zooniverse') {
      avatar = <ZooniverseLogo width="40" height="40" />;
    } else {
      avatar = <img src={src} className="notification-section__img" alt="Project Avatar" />;
    }
    return (
      <Link to={this.props.slug ? `/projects/${this.props.slug}` : '/'}>
        {avatar}
      </Link>
    );
  }

  unreadCircle() {
    const centerNum = this.state.unread > 9 ? '30%' : '40%';

    return (
      <svg className="notification-section__img">
        <circle cx="0" cy="0" r="100" fill="#E45950">
          <title> {`${this.state.unread} Unread Notification(s)`} </title>
        </circle>
        <text x={centerNum} y="50%" stroke="white" strokeWidth="2px" dy=".3em">{this.state.unread}</text>
      </svg>
    );
  }

  renderHeader() {
    const buttonType = this.props.expanded ? 'fa fa-times fa-lg' : 'fa fa-chevron-down fa-lg';

    return (
      <div onClick={this.onSectionToggle}>
        <div className="notification-section__container">
          <div className="notification-section__item">
            {this.avatarFor()}
          </div>

          <div className="notification-section__item">
            <h3 className="notification-section__title">{this.state.name}</h3>
          </div>

          <div className="notification-section__item">
            <button title="Toggle Section">
              <i className={buttonType} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const l = this.state.currentMeta;

    return (
      <div className="notification-section">

        {this.renderHeader()}

        {!!this.state.error && (
          <div className="notification-section__error">
            {this.state.error.toString()}
          </div>
        )}

        {(this.props.expanded) && (
          this.state.notifications.map((notification) => {
            return (
              <Notification
                notification={notification}
                key={notification.id}
                user={this.props.user}
              />);
          })
        )}

        {(this.props.expanded) && (
          <div className="centering">
            <Paginator
              className="notification-section__container"
              page={+this.state.currentMeta.page}
              pageCount={this.state.lastMeta.page_count}
              itemCount={true}
              firstAndLast={false}
              pageSelector={false}
              nextLabel={<span>older <i className="fa fa-chevron-right" /></span>}
              previousLabel={<span><i className="fa fa-chevron-left" /> previous</span>}
              onClickNext={this.markAsRead.bind(this, 'first')}
              totalItems={<span className="notification-section__item-count">{(l.page * l.page_size) - (l.page_size - 1)} - {Math.min(l.page_size * l.page, l.count)} of {l.count}</span>}
            />
          </div>
        )}

      </div>
    );
  }
}

NotificationSection.propTypes = {
  callbackParent: React.PropTypes.func,
  expanded: React.PropTypes.bool,
  location: React.PropTypes.object,
  projectID: React.PropTypes.string,
  section: React.PropTypes.string,
  slug: React.PropTypes.string,
  user: React.PropTypes.object,
};

NotificationSection.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

NotificationSection.defaultProps = {
  expanded: false,
};

export default NotificationSection;
