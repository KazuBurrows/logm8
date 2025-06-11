import React, { useState } from "react";
import { useLocation } from 'react-router-dom';

import { Section } from "./Section";


export default function LogDetail() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('token'); // Extract the 'id' value

    // const { id } = useParams<{ id: string }>();
  return (
    <Section id={""} className="h-screen">
        {id}
    </Section>
  );
};

