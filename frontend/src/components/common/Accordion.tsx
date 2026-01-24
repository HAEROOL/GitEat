import React, { createContext, useContext } from "react";

interface AccordionContextType {
  expanded: boolean;
  toggle: (event: React.SyntheticEvent) => void;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

interface AccordionProps {
  expanded?: boolean;
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Accordion = ({
  expanded = false,
  onChange,
  children,
  className = "",
  id,
}: AccordionProps) => {
  console.log("Accordion rendered, expanded:", expanded);
  
  const toggle = (event: React.SyntheticEvent) => {
    if (onChange) {
      onChange(event, !expanded);
    }
  };

  return (
    <AccordionContext.Provider value={{ expanded, toggle }}>
      <div
        id={id}
        className={`border border-gray-200 rounded-lg overflow-hidden mb-2 bg-white ${className}`}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

interface AccordionSummaryProps {
  children: React.ReactNode;
  expandIcon?: React.ReactNode;
  className?: string;
  id?: string;
}

export const AccordionSummary = ({
  children,
  expandIcon,
  className = "",
  id,
}: AccordionSummaryProps) => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionSummary must be used within Accordion");
  }

  const { expanded, toggle } = context;
  
  console.log("AccordionSummary rendered, expanded:", expanded);

  return (
    <div
      id={id}
      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 select-none ${className}`}
      onClick={toggle}
    >
      <div className="flex-1">{children}</div>
      {expandIcon && (
        <div
          className={`transition-transform duration-1000 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          {expandIcon}
        </div>
      )}
    </div>
  );
};

interface AccordionDetailsProps {
  children: React.ReactNode;
  className?: string;
}

export const AccordionDetails = ({
  children,
  className = "",
}: AccordionDetailsProps) => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionDetails must be used within Accordion");
  }

  const { expanded } = context;

  console.log("AccordionDetails expanded:", expanded);

  return (
    <div
      className={`border-t border-gray-200 overflow-hidden transition-all duration-1000 ease-in-out ${
        expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className={`p-4 ${className}`}>{children}</div>
    </div>
  );
};
