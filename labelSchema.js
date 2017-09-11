var _ = require('lodash');

// find the first field of record that has a non-empty value that's not already in labelParts
function getFirstProperty(fields) {
  return function(record) {
    for (var i = 0; i < fields.length; i++) {
      var fieldValue = record[fields[i]];

      if (!_.isEmpty(fieldValue)) {
        return fieldValue[0];
      }

    }

  };

}

// this function is exclusively used for figuring out which field to use for states/provinces
// 1.  if the record belongs to a dependency, skip the region, eg - San Juan, PR
// 2.  if a state/province is the most granular bit of info entered, the label should contain
//  the full state/province name, eg: Pennsylvania, USA and Ontario, CA
// 3.  otherwise, the state/province abbreviation should be used, eg: Lancaster, PA, USA and Bruce, ON, CA
// 4.  if the abbreviation isn't available, use the full state/province name
function getRegionalValue(record) {
  if (!_.isEmpty(record.dependency) || !_.isEmpty(record.dependency_a)) {
    return;
  }

  if ('region' === record.layer && !_.isEmpty(record.region)) {
    // return full state name when state is the most granular piece of info
    return record.region[0];

  } else if (!_.isEmpty(record.region_a)) {
    // otherwise just return the region code when available
    return record.region_a[0];

  } else if (!_.isEmpty(record.region)) {
    // return the full name when there's no region code available
    return record.region[0];

  }

}

// this function generates the last field of the labels for US records
// 1.  use dependency name if layer is dependency, eg - Puerto Rico
// 2.  use country name if layer is country, eg - United States
// 3.  use dependency abbreviation if applicable, eg - San Juan, PR
// 4.  use dependency name if no abbreviation, eg - San Juan, Puerto Rico
// 5.  use country abbreviation, eg - Lancaster, PA, USA
function getUSADependencyOrCountryValue(record) {
  if ('dependency' === record.layer && !_.isEmpty(record.dependency)) {
    return record.dependency[0];
  } else if ('country' === record.layer && !_.isEmpty(record.country)) {
    return record.country[0];
  }

  if (!_.isEmpty(record.dependency_a)) {
    return record.dependency_a[0];
  } else if (!_.isEmpty(record.dependency)) {
    return record.dependency[0];
  }

  return record.country_a[0];
}

module.exports = {
  'default': {
    'local': getFirstProperty(['locality', 'localadmin']),
    'country': getFirstProperty(['dependency', 'country'])
  },
  'GBR': {
    'local': getFirstProperty(['locality', 'localadmin']),
    'regional': getFirstProperty(['macroregion']),
    'country': getFirstProperty(['dependency', 'country'])
  },
  'USA': {
    'neighborhood' : getFirstProperty(['neighbourhood']),
    'borough': getFirstProperty(['borough','locality', 'localadmin', 'county']),
  },
  'AUS': {
    'local' : getFirstProperty(['locality', 'localadmin']),
    'regional' : getRegionalValue,
    'country': getFirstProperty(['dependency', 'country'])
  },
  'CAN': {
    'local': getFirstProperty(['locality']), // no localadmins in CAN
    'regional': getRegionalValue,
    'country': getFirstProperty(['country'])
  }
};
