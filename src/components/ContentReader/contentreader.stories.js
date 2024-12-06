import React from 'react';

import Row from '../Row';
import ContentReader from './ContentReader';

export default {
  title: 'ContentReader',
  component: ContentReader,
};

const json = `{
  "Interchange": {
    "DataElementSeparator": "*",
    "SegmentSeparat123or1": "~%WSP*; %NL;%WSP*;",
    "SegmentSeparato123r": "~%WSP*; %NL;%WSP*;",
    "SegmentSepar1ator": "~%WSP*; %NL;%WSP*;",
    "Segmen1tSepara2tor": "~%WSP*; %NL;%WSP*;",
    "Segment213Separat2or": "~%WSP*; %NL;%WSP*;",
    "SegmentSe23parato4r": "~%WSP*; %NL;%WSP*;",
    "aSegmentSepa23rato6r": "~%WSP*; %NL;%WSP*;",
    "SegmentSeparasdasa231to7r": "~%WSP*; %NL;%WSP*;",
    "ISA": {
      "ISA15": "Test",
      "ISA16": ">"
    }
  }
}`;

const xml = `<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="items" type="ItemsType"/>
  <xs:complexType name="ItemsType">
    <xs:choice minOccurs="0" maxOccurs="unbounded">
      <xs:element name="shirt" type="ProductType"/>
      <xs:element name="hat" type="ProductType"/>
      <xs:element name="umbrella" type="ProductType"/>
    </xs:choice>
  </xs:complexType>
  <!-- Element only content -->
  <xs:complexType name="ProductType">
    <xs:sequence>
      <xs:element name="number" type="xs:integer"/>
      <xs:element name="name" type="xs:string"/>
      <xs:choice minOccurs="0" maxOccurs="unbounded">
        <xs:element name="size" type="SizeType"/>
        <xs:element name="color" type="ColorType"/>
        <xs:element name="description" type="DescriptionType"/>
      </xs:choice>
    </xs:sequence>
    <xs:attribute  name="effDate" type="xs:date"
                    default="1900-01-01"/>
    <xs:anyAttribute namespace="##other" processContents="lax"/>
  </xs:complexType>
  <!-- Simple content -->
  <xs:complexType name="SizeType">
    <xs:simpleContent>
      <xs:extension base="xs:integer">
        <xs:attribute name="system" type="xs:token"/>
      </xs:extension>
    </xs:simpleContent>
  </xs:complexType>
  <!-- Empty content -->
  <xs:complexType name="ColorType">
    <xs:attribute name="value" type="xs:string"/>
  </xs:complexType>
  <!-- Mixed content -->
  <xs:complexType name="DescriptionType" mixed="true">
    <xs:sequence>
      <xs:any namespace="http://www.w3.org/1999/xhtml"
      minOccurs="0" maxOccurs="unbounded"
      processContents="skip"/>
    </xs:sequence>
  </xs:complexType>
</xs:schema>
`;

export const ParsingJSONContent = () => (
  <Row style={{ maxHeight: '100%' }}>
    <ContentReader data={json} />
  </Row>
);

export const ParsingXMLContent = () => (
  <Row style={{ maxHeight: '100%' }}>
    <ContentReader data={xml} />
  </Row>
);
