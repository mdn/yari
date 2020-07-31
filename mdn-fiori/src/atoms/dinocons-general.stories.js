import React from "react";

import Asterisk from "../../dinocons/general/asterisk.svg";
import Book from "../../dinocons/general/book.svg";
import CheckMark from "../../dinocons/general/check-mark.svg";
import Clock from "../../dinocons/general/clock.svg";
import Close from "../../dinocons/general/close.svg";
import CloseModal from "../../dinocons/general/close-modal.svg";
import Cogs from "../../dinocons/general/cogs.svg";
import Comment from "../../dinocons/general/comment.svg";
import Community from "../../dinocons/general/community.svg";
import CreditCard from "../../dinocons/general/credit-card.svg";
import Email from "../../dinocons/general/email.svg";
import External from "../../dinocons/general/external.svg";
import Flag from "../../dinocons/general/flag.svg";
import Flask from "../../dinocons/general/flask.svg";
import Fork from "../../dinocons/general/fork.svg";
import Gift from "../../dinocons/general/gift.svg";
import Globe from "../../dinocons/general/globe.svg";
import Language from "../../dinocons/general/language.svg";
import List from "../../dinocons/general/list.svg";
import Lock from "../../dinocons/general/lock.svg";
import Money from "../../dinocons/general/money.svg";
import Paperclip from "../../dinocons/general/paperclip.svg";
import Pencil from "../../dinocons/general/pencil.svg";
import Search from "../../dinocons/general/search.svg";
import Shield from "../../dinocons/general/shield.svg";
import Star from "../../dinocons/general/star.svg";
import Tags from "../../dinocons/general/tags.svg";
import Trash from "../../dinocons/general/trash.svg";

export default {
  title: "Atoms|Dinocons|General"
};

const wrapperStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px"
};

const iconContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "24px",
  padding: "5px",
  border: "1px solid #212121",
  width: "100px",
  height: "100px"
};

export const general = () => (
  <>
    <h2>Brands</h2>
    <div style={wrapperStyle}>
      <div style={iconContainer}>
        <Asterisk />
      </div>
      <div style={iconContainer}>
        <Book />
      </div>
      <div style={iconContainer}>
        <CheckMark />
      </div>
      <div style={iconContainer}>
        <Clock />
      </div>
      <div style={iconContainer}>
        <Close />
      </div>
      <div style={iconContainer}>
        <CloseModal />
      </div>
      <div style={iconContainer}>
        <Cogs />
      </div>
      <div style={iconContainer}>
        <Comment />
      </div>
      <div style={iconContainer}>
        <Community />
      </div>
      <div style={iconContainer}>
        <CreditCard />
      </div>
      <div style={iconContainer}>
        <Email />
      </div>
      <div style={iconContainer}>
        <External />
      </div>
      <div style={iconContainer}>
        <Flag />
      </div>
      <div style={iconContainer}>
        <Flask />
      </div>
      <div style={iconContainer}>
        <Fork />
      </div>
      <div style={iconContainer}>
        <Gift />
      </div>
      <div style={iconContainer}>
        <Globe />
      </div>
      <div style={iconContainer}>
        <Language />
      </div>
      <div style={iconContainer}>
        <List />
      </div>
      <div style={iconContainer}>
        <Lock />
      </div>
      <div style={iconContainer}>
        <Money />
      </div>
      <div style={iconContainer}>
        <Paperclip />
      </div>
      <div style={iconContainer}>
        <Pencil />
      </div>
      <div style={iconContainer}>
        <Search />
      </div>
      <div style={iconContainer}>
        <Shield />
      </div>
      <div style={iconContainer}>
        <Star />
      </div>
      <div style={iconContainer}>
        <Tags />
      </div>
      <div style={iconContainer}>
        <Trash />
      </div>
    </div>
  </>
);
