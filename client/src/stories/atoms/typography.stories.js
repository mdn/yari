import React from "react";

const defaults = {
  title: "Atoms/Typography",
};

export default defaults;

export const typography = () => {
  return (
    <>
      <h1>Heading level 1</h1>
      <ul>
        <li>Desktop/Tablet: ZillaSlab Bold 4.209rem</li>
        <li>Mobile: ZillaSlab Bold 2.488rem</li>
      </ul>
      <h2>Heading level 2</h2>
      <ul>
        <li>Desktop/Tablet: ZillaSlab Bold 3.157rem</li>
        <li>Mobile: ZillaSlab Bold 2.074rem</li>
      </ul>
      <h3>Heading level 3</h3>
      <ul>
        <li>Desktop/Tablet: ZillaSlab Regular 3.157rem</li>
        <li>Mobile: ZillaSlab Regular 1.728rem</li>
      </ul>
      <h4>Heading level 4</h4>
      <ul>
        <li>Desktop/Tablet: Arial Bold 1.777rem</li>
        <li>Mobile: Arial Bold 1.44rem</li>
      </ul>
      <h5>Heading level 5</h5>
      <ul>
        <li>Desktop/Tablet: Arial Bold 1.333rem</li>
        <li>Mobile: Arial Bold 1.2rem</li>
      </ul>

      <h2>Paragraph Text</h2>
      <p>Arial Regular 1rem</p>
      <p>
        Cat ipsum dolor sit amet, munch on tasty moths chase imaginary bugs meow
        all night. Human is in bath tub, emergency! drowning! meooowww! need to
        check on human, have not seen in an hour might be dead oh look, human is
        alive, hiss at human, feed me for put butt in owner's face, mark
        territory. I rule on my back you rub my tummy i bite you hard munch on
        tasty moths knock dish off table head butt cant eat out of my own dish
        meow loudly just to annoy owners or poop in litter box, scratch the
        walls pose purrfectly to show my beauty and use lap as chair. Refuse to
        leave cardboard box chase ball of string for stare at wall turn and meow
        stare at wall some more meow again continue staring or shred all toilet
        paper and spread around the house so intently sniff hand. Human is in
        bath tub, emergency!{" "}
      </p>
      <h2>small font size</h2>
      <p>Arial Regular 0.9rem (16px)</p>
      <p className="smaller-text">
        Cat ipsum dolor sit amet, munch on tasty moths chase imaginary bugs meow
        all night.
      </p>
      <h2>tiny text</h2>
      <p>Arial Regular 0.75rem (13.5px)</p>
      <p className="tiny-text">
        Cat ipsum dolor sit amet, munch on tasty moths chase imaginary bugs meow
        all night.
      </p>
    </>
  );
};
