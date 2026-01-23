# 👥 Users Module

The **Users Module** is a front-end module for **Linid Identity Manager** that provides user-related interfaces and functionality.
It integrates seamlessly with the platform’s modular architecture and can be enabled, configured, or extended depending on deployment needs.

This module is part of the **linid-im-front-community-plugins** repository and relies on the core front-end libraries of Linid Identity Manager.

---

## 🔮 Future Capabilities

The Users Module introduces the foundation for user management features and is designed to evolve alongside the platform. Planned capabilities include:

### Core features

- Listing users retrieved from the backend data source.
- Displaying detailed information about individual users.
- Managing fields and attributes associated with the User entity.

### Modular and extensible design

- Ability to be extended by other modules (e.g., additional user UI, custom views, specialized user tools).
- Integration within the hierarchical module system of Linid Identity Manager.

---

## 🗺️ Roadmap

Planned enhancements focus on delivering a full user-management experience through dedicated views and actions:

- **Page to list all users** with pagination, sorting, and basic filters
- **Page to view detailed user information**, including attributes, metadata, and related entities
- **Page to create a new user**, with form validation and configurable fields
- **Page to edit an existing user**, allowing updates to core and custom attributes
- **Action to delete a user**, with confirmation workflow and backend validation
- **Enhanced search capabilities** for locating users quickly in large directories

---

## 📘 Documentation

Documentation for the Users Module is located in the `apps/module-users/docs/` folder:

- **[Configuration Guide](./docs/configuration.md)** — Module configuration options (userIdKey, columns, advanced search, etc.)
- **[Design Configuration](./docs/design.md)** — Visual customization via `design.json`

---

## 📄 License

This module is released under the **GNU Affero General Public License (AGPL)** and maintained by **Linagora**.
