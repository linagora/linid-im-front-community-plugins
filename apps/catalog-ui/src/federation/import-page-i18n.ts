/*
 * Copyright (C) 2026 Linagora
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General
 * Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version, provided you comply with the Additional Terms applicable for LinID Identity Manager software by
 * LINAGORA pursuant to Section 7 of the GNU Affero General Public License, subsections (b), (c), and (e), pursuant to
 * which these Appropriate Legal Notices must notably (i) retain the display of the "LinID™" trademark/logo at the top
 * of the interface window, the display of the “You are using the Open Source and free version of LinID™, powered by
 * Linagora © 2009–2013. Contribute to LinID R&D by subscribing to an Enterprise offer!” infobox and in the e-mails
 * sent with the Program, notice appended to any type of outbound messages (e.g. e-mail and meeting requests) as well
 * as in the LinID Identity Manager user interface, (ii) retain all hypertext links between LinID Identity Manager
 * and https://linid.org/, as well as between LINAGORA and LINAGORA.com, and (iii) refrain from infringing LINAGORA
 * intellectual property rights over its trademarks and commercial brands. Other Additional Terms apply, see
 * <http://www.linagora.com/licenses/> for more details.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License and its applicable Additional Terms for
 * LinID Identity Manager along with this program. If not, see <http://www.gnu.org/licenses/> for the GNU Affero
 * General Public License version 3 and <http://www.linagora.com/licenses/> for the Additional Terms applicable to the
 * LinID Identity Manager software.
 */

export default {
  'fr-FR': {
    '{{ config.instanceId }}': {
      title: 'Import de données',
      ButtonsCard: {
        cancel: 'Annuler',
        confirm: 'Importer',
        confirmLoading: 'Import en cours…',
      },
      DropdownButton: {
        title: 'Effacer…',
        clearAll: 'Toutes les lignes',
        clearError: 'Lignes avec erreurs',
        clearImported: 'Lignes importées',
      },
      LoadFilesField: {
        label: 'Fichiers à importer',
        loadSuccess: 'Fichier(s) chargé(s) avec succès',
        loadEmpty: 'Aucune ligne à importer',
        loadError: 'Erreur lors du chargement des fichiers',
      },
      ImportedDataTable: {
        expandButtonOpen: 'Voir les erreurs',
        expandButtonClose: 'Fermer',
        deleteButton: 'Supprimer',
        headers: {
          __error: '',
          __delete: 'Actions',
          __status: 'Statut',
          __file: 'Source',
        },
        status: {
          READY: 'Prêt',
          IMPORTING: 'Import en cours',
          IMPORTED: 'Importé',
          ERROR: 'Erreur(s)',
        },
        rowsPerPage: 'Lignes par page',
        paginationLabel: '{start}–{end} sur {total}',
        noData: 'Aucune donnée',
      },
      importSuccess: 'Toutes les données ont été importées avec succès',
      importWarning: "Certaines données n'ont pas pu être importées",
      importError: "Aucune donnée n'a pu être importée",
      clearSuccess: 'Les lignes ont été supprimées avec succès',
      clearWarning: "Aucune ligne n'a été supprimée",
    },
  },
  'en-US': {
    '{{ config.instanceId }}': {
      title: 'Data import',
      ButtonsCard: {
        cancel: 'Cancel',
        confirm: 'Import',
        confirmLoading: 'Importing…',
      },
      DropdownButton: {
        title: 'Clear…',
        clearAll: 'All rows',
        clearError: 'Rows with errors',
        clearImported: 'Imported rows',
      },
      LoadFilesField: {
        label: 'Files to import',
        loadSuccess: 'File(s) loaded successfully',
        loadEmpty: 'No rows to import',
        loadError: 'Error while loading files',
      },
      ImportedDataTable: {
        expandButtonOpen: 'View errors',
        expandButtonClose: 'Close',
        deleteButton: 'Delete',
        headers: {
          __error: '',
          __delete: 'Actions',
          __status: 'Status',
          __file: 'Source',
        },
        status: {
          READY: 'Ready',
          IMPORTING: 'Importing',
          IMPORTED: 'Imported',
          ERROR: 'Error(s)',
        },
        rowsPerPage: 'Rows per page',
        paginationLabel: '{start}–{end} of {total}',
        noData: 'No data',
      },
      importSuccess: 'All data has been imported successfully',
      importWarning: 'Some data could not be imported',
      importError: 'No data could be imported',
      clearSuccess: 'Rows have been deleted successfully',
      clearWarning: 'No rows have been deleted',
    },
  },
};
