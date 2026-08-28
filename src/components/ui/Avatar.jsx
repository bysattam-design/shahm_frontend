import React from "react";

function initial(name, email) {
  const source = (name || email || "").trim();
  return source ? source[0].toUpperCase() : "؟";
}

export function Avatar({ name, email, src, size = "md", title }) {
  const label = title || name || email || "";

  if (src) {
    return (
      <span className={`ui-avatar ui-avatar--${size}`} title={label}>
        <img className="ui-avatar__image" src={src} alt="" />
      </span>
    );
  }

  return (
    <span className={`ui-avatar ui-avatar--${size}`} title={label} aria-hidden={!label}>
      {initial(name, email)}
    </span>
  );
}

/**
 * Several people in the space of one and a half.
 *
 * Beyond `max` the rest become a count rather than a longer row, so a record
 * with three owners and a record with thirty occupy the same width.
 */
export function AvatarStack({ people = [], max = 4, size = "sm" }) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;

  return (
    <span className="ui-avatar-stack">
      {shown.map((person, index) => (
        <Avatar
          key={person.id ?? person.email ?? index}
          name={person.name}
          email={person.email}
          src={person.image}
          size={size}
        />
      ))}
      {rest > 0 && (
        <span className={`ui-avatar ui-avatar--${size} ui-avatar--count`}>+{rest}</span>
      )}
    </span>
  );
}

export default Avatar;
