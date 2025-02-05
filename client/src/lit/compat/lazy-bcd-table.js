import { LitElement, html } from "lit";
import { createComponent } from "@lit/react";
import React from "react";
import { BCD_BASE_URL } from "../../env.ts";
import "./bcd-table.js";

class LazyBcdTable extends LitElement {
  static properties = {
    _id: {},
    _title: {},
    ish3: {},
    query: {},
    locale: {},
    data: { state: true },
    error: { state: true },
    loading: { state: true },
  };

  constructor() {
    super();
    this._id = "";
    this._title = "";
    this.ish3 = "";
    this.query = "";
    this.locale = "";
    this.data = null;
    this.error = null;
    this.loading = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.loading = true;
  }

  /**
   * @param {Map<string, any>} changedProperties
   * @returns {Promise<void>}
   */
  async update(changedProperties) {
    super.update(changedProperties);
    if (changedProperties.has("query")) {
      await this.fetchData(this.query);
    }
  }

  /**
   * @param {string} query
   * @returns {Promise<void>}
   */
  async fetchData(query) {
    try {
      const res = await fetch(
        `${BCD_BASE_URL}/bcd/api/v0/current/${query}.json`
      );
      this.data = await res.json();
    } catch (error) {
      this.error = error;
    } finally {
      this.loading = false;
    }
  }

  renderTitle() {
    const { _id, _title, ish3 } = this;

    if (!_title) {
      return "";
    } else if (ish3) {
      return html`<h3 id=${_id}>${_title}</h3>`;
    } else {
      return html`<h2 id=${_id}>${_title}</h2>`;
    }
  }

  renderContent() {
    if (this.loading) {
      return html`<p>Loading...</p>`;
    }
    if (this.error) {
      return html`<p>Error loading data</p>`;
    }
    if (!this.data) {
      return html`<p>No compatibility data found</p>`;
    }
    return html`<bcd-table
      .compat=${this.data}
      query=${this.query}
      locale=${this.locale}
    ></bcd-table>`;
  }

  render() {
    return html`${this.renderTitle()} ${this.renderContent()} `;
  }
}

customElements.define("lazy-bcd-table", LazyBcdTable);

export default createComponent({
  tagName: "lazy-bcd-table",
  elementClass: LazyBcdTable,
  react: React,
});
