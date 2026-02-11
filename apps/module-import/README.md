# 📥 Import Module

The **Import Module** is a front-end module for **Linid Identity Manager** that enables CSV data import for any existing entity module.

It integrates seamlessly with a parent module via configuration, allowing administrators to define **where the import action appears**, **how CSV columns map to entity fields**, and **how data is validated** before submission.

This module is part of the **linid-im-front-community-plugins** repository and relies on the core front-end libraries of Linid Identity Manager.

---

## 🎯 Purpose

The Import Module provides a configurable and reusable mechanism to:

- Upload CSV files
- Preview CSV content in a table
- Map CSV columns to entity attributes via configuration
- Validate imported data based on module rules
- Submit bulk create or update requests to the backend API

All behavior is driven by the parent module configuration; no hardcoded mapping or button placement is required.

---

## ⚙️ How It Works

1. The parent module defines the **import action** (e.g., toolbar button or menu item) via configuration.
2. Users navigate to the **Import page** provided by the module.
3. On the page, users can:

- Upload a CSV file
- Preview the file contents in a table
- Verify and optionally edit rows before import

4. After validation, users submit the data, which is sent to the configured API endpoint.
5. The module handles error reporting for rows that fail validation.

---

## 🔮 Core Capabilities

### Configurable Integration

- Define **where the import button appears** in the parent module.
- Configure **CSV headers mapping** to entity fields.
- Set validation rules and required fields via parent module configuration.

### CSV Preview & Validation

- Display CSV data in a **table before import**.
- Validate each row according to entity rules (type, format, required).
- Show errors directly in the preview table for correction.

### Bulk Operations

- Bulk create or update entities in the backend API.
- Error handling and feedback for failed rows.
- Configurable behavior based on module-specific rules.

---

## 🧩 Modular and Extensible Design

- Can attach to **any compatible entity module**.
- Fully configurable via parent module settings.
- Extensible for additional file formats, transformation rules, or import templates.

---

## 🗺️ Roadmap

Planned enhancements:

- Drag-and-drop CSV upload
- Import history with status tracking
- Asynchronous background import for large files
- Downloadable error report for rejected rows
- Advanced field transformation and mapping hooks

---

## 📘 Documentation

Documentation for the Import Module is located in the `apps/module-import/docs/` folder:

- **[Configuration Guide](./docs/configuration.md)** — Module configuration options (csv options, etc.)
- **[Design Configuration](./docs/design.md)** — Visual customization via `design.json`
- **[I18N Configuration](./docs/i18n.md)** — I18n customization

---

## 🔗 Example Use Case

When attached to the **Users Module**:

- An **Import button** appears in the zone of users module.
- Import page will be added inside users routes.
- The CSV is previewed in a table with validation highlights.
- Valid rows are sent to the Users API for bulk creation or update.

---

## 📄 License

This module is released under the **GNU Affero General Public License (AGPL)** and maintained by **Linagora**.
