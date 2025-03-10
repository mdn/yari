import { LitElement, html } from "lit";
import { createComponent } from "@lit/react";
import React from "react";
import { BCD_BASE_URL } from "../../env.ts";
import "./bcd-table.js";

class LazyBcdTable extends LitElement {
  static properties = {
    _id: {},
    query: {},
    locale: {},
    compat: { state: true },
    error: { state: true },
    loading: { state: true },
  };

  constructor() {
    super();
    this._id = "";
    this.query = "";
    this.locale = "";
    this.compat = null;
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
      this.compat = await res.json();
    } catch (error) {
      this.error = error;
    } finally {
      this.loading = false;
    }
  }

  render() {
    if (this.loading) {
      return html`<p>Loading...</p>`;
    }
    if (this.error) {
      return html`<p>Error loading data</p>`;
    }
    if (!this.compat) {
      return html`<p>No compatibility data found</p>`;
    }
    return html`<bcd-table
      query=${this.query}
      locale=${this.locale}
      .data=${this.compat.data}
      .browserInfo=${this.compat.browsers}
    ></bcd-table>`;
  }
}

customElements.define("lazy-bcd-table", LazyBcdTable);

export default createComponent({
  tagName: "lazy-bcd-table",
  elementClass: LazyBcdTable,
  react: React,
});
