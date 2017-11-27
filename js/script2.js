/* 

1- chiamata ajax prodotti;
2- creo pulsanti per prodotti,
3- creo lista di prodotti, 

*/


(function (adg$) {

    var ADG = {
        lavorazioni: {},
        prodotti: {},
        selectedProduct: {},
        tecniche: {},

        init: function () {
            ADG
                .bindActions()
                .getData('prodotti');
        },
        bindActions: function () {
            var ADG = this;
            adg$('body')
                .on({
                    'click': function () {
                        var productID = adg$(this).attr('id');
                        ADG.showProducts(productID);
                    }
                }, '.product_btn')
                .on({
                    'change': function () {
                        var select = adg$(this);
                        ADG.checkSelected(select);
                    }
                }, '.select')
                .on({
                    'click': function (e) {
                        e.preventDefault();
                        var btn = adg$(this);
                        ADG
                            .activeCards(btn);
                    }
                }, '.product-cta')
                .on({
                    'keyup': function () {
                        ADG.updatePrice();
                        ADG.updateQuantity();
                    }
                }, 'input[name="shirtQuantity"]')
                .on({
                    'click': function (e) {
                        e.preventDefault();
                        console.log('azzera da fare');
                        adg$('#materials .container').html('');
                        adg$('#prodotti__container').html('');
                        adg$('#summary').addClass('second-step');
                        ADG.createSummary();
                    }
                }, '.custom')
                .on({
                    'click': function (e) {
                        e.preventDefault();
                        console.log('vai indietro');
                    }
                }, '.back')
                .on({
                    'click': function (e) {
                        e.preventDefault();
                        console.log('aggiungi al carrello');
                        var totalprice = adg$(this).parents('.summary-content').find('.price').text();
                        ADG.selectedProduct.totalPrice = totalprice;
                        console.log('azzera da fare');
                        adg$('#materials .container').html('');
                        adg$('#prodotti__container').html('');
                        adg$('#summary').remove();
                        ADG.checkout();
                        console.log(ADG.selectedProduct);
                    }
                }, '.cart')
                .on({
                    'click': function (e) {
                        e.preventDefault();
                        ADG
                            .getData('tecniche');
                        ADG.addCustom();
                    }
                }, '.addCustom')
                .on({
                    'blur': function () {
                        ADG
                            .checkDimension(adg$(this))
                            .calculatePrice(adg$(this));
                    }

                }, '.dimension')
                .on({
                    'change': function (e) {
                        e.preventDefault();
                        var ID = adg$(this).parents('.single-application').attr('id'),
                            key = adg$(this).data('select'),
                            value = adg$(this).val();
                        ADG.handleTechic(adg$(this));
                    }
                }, '.select-technics')
                .on({
                    'change': function (e) {
                        e.preventDefault();
                        ADG.updateApplication(adg$(this));
                    }
                }, '.application-select')
                .on({
                    'change': function (e) {
                        e.preventDefault();
                        ADG.setDimenzionLimit(adg$(this));
                    }
                }, '.select-position')
                .on({
                    'change': function (e) {
                        e.preventDefault();
                        var tecnica = adg$(this).parents('.single-application--elements').find('.select-technics').val(),
                            select = adg$(this);
                        ADG.populateColor(tecnica, select);
                    }
                }, '.select-style')
                .on({
                    'click': function (e) {
                        e.preventDefault();
                        ADG
                            .addApplication(adg$(this))
                            .createSummary()
                            .updatePrice();
                        adg$(this).prop('disabled', true);
                    }
                }, '.more')
                .on({
                    'click': function (e) {
                        e.preventDefault();
                        ADG.removeApplication(adg$(this)).createSummary();
                        ADG.updatePrice();
                        console.log(ADG.selectedProduct);
                    }
                }, '.remove');
            return ADG;
        },
        /* CHIAMATA AJAX GENERICA */
        ajaxCall: function (dataType) {
            return adg$.ajax({
                type: "GET",
                url: 'js/json/' + dataType + '.json',
                dataType: 'json'
            });
        },
        getData: function (dataType) {
            var ADG = this;
            var getData = new adg$.Deferred();

            var AjaxCallPromise = getData
                .then(function () {
                    return ADG.ajaxCall(dataType);
                })
                .done(function (data) {})
                .fail(function () {});

            var interpolateDataPromise = AjaxCallPromise
                .then(function (data) {
                    if (dataType == 'prodotti') {
                        return ADG.saveProducts(data, dataType);
                    } else {
                        return ADG.saveTechnics(data, dataType);
                    }
                })
                .done(function () {})
                .fail(function () {});
            getData
                .resolve();

            return getData.promise();
        },
        saveProducts: function (data, dataType) {
            var ADG = this,
                productsBtn = [],
                productsArray = data,
                container = adg$('#prodotti__container');
            adg$.each(productsArray, function (index, product) {
                //salva nome prodotti nell'array dei bottoni
                productsBtn.push('<li><a href="javascript:void(0)" id="' + index + '" class="product_btn">' + index + '</a></li>');
                //salva i prodotti
                ADG.prodotti[index] = product;
            });
            //stampa una lista
            adg$('<ul/>', {
                'class': 'product-list',
                html: productsBtn.join('')
            }).appendTo(container);
        },
        saveTechnics: function (data, dataType) {
            var ADG = this,
                productsArray = data;
            adg$.each(productsArray, function (index, product) {
                ADG.tecniche[index] = product;
            });
        },
        showProducts: function (productID) {
            var ADG = this,
                products = productID,
                productObj = ADG.prodotti[products],
                html = '',
                container = adg$('#materials .container');

            container.html('');
            adg$.each(productObj, function (index, el) {

                html += '<div class="product-single" id="' + el.id + '" data-prezzo="' + el.prezzo + '" data-brand="' + el.brand + '"  data-modello="' + el.modello + '" data-type="' + productID + '" data-index="' + index + '" >' +
                    '<div class="product-modello">' + el.modello + '</div>' +
                    '<div class="product-brand">' + el.brand + '</div>' +
                    '<div class="product-details">' +
                    '<div class="product-image">';
                el.image == "undefined" || el.image == '' ? html += '<img src="img/generica.png"/>' : html += '<img src="' + el.image + '"/>';
                html += '</div>' + // chiusura image
                    '<div class="product-addictedDetails">' +
                    '<div class="product-materiale">' + el.materiale + '</div>' +
                    '<div class="product-grammatura">' + el.grammatura + '</div>' +
                    '<div class="product-gender">' + el.gender + '</div>' +
                    '</div>' + //chiusura addicted
                    '</div>' + //chiusura details
                    '<div class="product-select">';
                if (el.colore.length > 0) {
                    html += '<select class="select select_colore" data-select="color">' +
                        '<option value="0">colore</option>';

                    adg$.each(el.colore, function (i, colore) {
                        html += '<option value="' + colore + '">' + colore + '</option>';
                    });
                    html += '</select>';
                }
                if (el.taglia.length > 0) {
                    html += '<select class="select select_taglia" data-select="size">' +
                        '<option value="0">taglia</option>';
                    adg$.each(el.taglia, function (i, taglia) {
                        html += '<option value="' + taglia + '">' + taglia + '</option>';
                    });
                    html += '</select>';
                }
                html += '</div>' + //chiusura select
                    '<div class="product-prezzo with_currency">' + el.prezzo.toFixed(2) + '</div>' +
                    '<button disabled href="" class="product-cta">scegli</button>' +
                    '</div>'; //chiusura single
            });
            container.append(html);
            return ADG;
        },
        activeCards: function (btn) {
            var ADG = this;
            var card = btn.parent(),
                summary = adg$('#summary'),
                cardSiblings = card.siblings('.selected');
            if (card.hasClass('selected')) {
                card.removeClass('selected');
                //ADG.updateSummary(btn);
                summary.hide();

            } else {
                card.addClass('selected');
                cardSiblings.removeClass('selected');
                ADG.saveSelectedProduct(btn).createSummary();
            }
            return ADG;
        },
        checkSelected: function (select) {
            var ADG = this,
                selectKey = select.data('select'),
                selectVal = select.val(),
                selectedCard = select.parents('.product-single'),
                selectedID = selectedCard.attr('id'),
                selectItem = selectedCard.find('.select'),
                button = selectedCard.find('.product-cta'),
                selected = 0;

            selectItem.each(function () {
                var value = adg$(this).val();
                if (value != '0') {
                    selected++;
                }
            });

            if (selected == selectItem.length) {
                if (!adg$.isEmptyObject(ADG.selectedProduct)) {
                    ADG.updateSelected(ADG.selectedProduct, selectKey, selectVal, selectedID);
                } else {
                    button.prop('disabled', false);
                }
                button.prop('disabled', false);
            } else if (selected > 0) {

            } else {
                ADG.showError('Devi selezionare colore e taglia');
                button.prop('disabled', true);
            }

            return ADG;
        },
        saveSelectedProduct: function (btn) {
            var ADG = this;
            var selected = btn.parent(),
                //recupero type e index per recuperare le posizioni
                selectedID = selected.attr('id'),
                selectedType = selected.data('type'),
                selectedindex = selected.data('index'),
                selectedPositions = ADG.prodotti[selectedType][selectedindex].stampa[0],
                selectedTechnics = ADG.prodotti[selectedType][selectedindex].tecniche;

            ADG.selectedProduct.type = selectedType;
            ADG.selectedProduct.ID = selectedID;
            ADG.selectedProduct.modello = selected.data('modello');
            ADG.selectedProduct.brand = selected.data('brand');
            ADG.selectedProduct.image = selected.find('img').attr('src');
            ADG.selectedProduct.price = selected.data('prezzo');
            ADG.selectedProduct.positions = selectedPositions;
            ADG.selectedProduct.technics = selectedTechnics;

            ADG.selectedProduct.color = selected.find('.select_colore :selected').val();
            ADG.selectedProduct.size = selected.find('.select_taglia :selected').val();
            ADG.selectedProduct.materiale = selected.find('.product-materiale').html();
            ADG.selectedProduct.grammatura = selected.find('.product-grammatura').html();
            ADG.selectedProduct.gender = selected.find('.product-gender').html();
            ADG.selectedProduct.quantity = 1;
            ADG.selectedProduct.partialPrice = '';
            ADG.selectedProduct.applicazioni = [];
            ADG.selectedProduct.totalPrice = '';

            return ADG;
        },
        createSummary: function () {
            var ADG = this;
            var summaryObj = ADG.selectedProduct,
                summary = adg$('#summary'),
                html = '';

            if (!adg$.isEmptyObject(summaryObj)) {
                summary.html('');
                html +=
                    '<div class="summary-content" data-selected="' + summaryObj.ID + '">' + //summary content
                    '<div class="product">' +
                    '<div class="selectedImage">' + //immagine
                    '<img src="' + summaryObj.image + '">' +
                    '</div>' + //fine immagine
                    '<div class="product-info">' + //product info
                    '<div class="title">' + summaryObj.modello + '</div>' +
                    '<div class="brand">' + summaryObj.brand + '</div>' +
                    '<div class="selectedQuantity">' + //quantità
                    '<span class="multiplier">x</span>';
                if (!summary.hasClass('second-step')) {
                    summaryObj.quantity == '' ? html += '<span class="quantity">1</span>' : html += '<span class="quantity">' + summaryObj.quantity + '</span>';
                } else {
                    summaryObj.quantity == '' ? html += '<span class="quantity">1</span>' : html += '<span class="quantity">' + summaryObj.quantity + '</span>';
                }
                html += '</div>' + //fine quantità

                    '<div class="selectedcolor">';
                summaryObj.color != undefined ? html += '<div class="color">' + summaryObj.color + '</div></div>' : html += '</div>';

                html += '<div class="selectedsize">';
                summaryObj.size != 'undefined' ? html += '<div class="size">' + summaryObj.size + '</div></div>' : html += '</div>';
                html += '</div>' + //fine product info
                    '</div>' + //fine product

                    //select quantity
                    '<div class="select-quantity">' +
                    '<div class="text">Seleziona la quantità:</div>' +
                    '<input id="quantity" type="number" name="shirtQuantity" min="1"';
                summaryObj.quantity > 0 ? html += 'value="' + summaryObj.quantity + '">' : html += 'value="1">';
                html += '</div>';
                //fine select quantity

                if (summaryObj.applicazioni.length > 0) {
                    html += '<div class="application">' +
                        '<div class="application-container">';

                    adg$.each(summaryObj.applicazioni, function (a, b) {
                        html += '<div class="single" id="' + b.ID + '">' +
                            '<div class="single-details">' +
                            '<div class="single-tecnica">';
                        b.tecnica != '0' ? html += '<div class="type">' + b.tecnica + '</div>' : html += '<div class="type"></div>';
                        b.tipo != '0' ? html += '<div class="style">' + b.tipo + '</div>' : html += '<div class="style"></div>';
                        b.colore != '0' ? html += '<div class="color">' + b.colore + '</div>' : html += '<div class="color"></div>';
                        html += '</div>' +
                            '<div class="single-posizione">' +
                            '<div class="position">' + b.posizione + '</div>' +
                            '<div class="width">' + b.larghezza + '</div>' +
                            '<div class="ics">x</div>' +
                            '<div class="height">' + b.altezza + '</div>' +
                            '</div>' +

                            '</div>' +

                            '<div class="single-price">' + b.costo + '</div>' +
                            '<div class="remove resume" data-id="' + b.ID + '">x</div>' +
                            '</div>';
                    })

                    html += '</div>' +
                        '</div>';
                } else {
                    html += '<div></div>';
                }
                // price
                html += '<div class="selectedPrice">' +
                    '<span class="price with_currency" data-price="' + summaryObj.price + '">';
                if (summaryObj.partialPrice != '') {
                    if (summaryObj.applicazioni.length > 0) {
                        var applicationSum = 0,
                            sum;

                        adg$.each(summaryObj.applicazioni, function (k, v) {
                            var price = summaryObj.applicazioni[k].costo;
                            applicationSum += price;
                        });
                        sum = (applicationSum * summaryObj.quantity) + summaryObj.partialPrice;
                        html += sum.toFixed(2);
                    } else {
                        html += summaryObj.partialPrice.toFixed(2)
                    }

                } else {
                    if (summaryObj.applicazioni.length > 0) {
                        var applicationSum = 0,
                            sum;

                        adg$.each(summaryObj.applicazioni, function (k, v) {
                            var price = summaryObj.applicazioni[k].costo;
                            applicationSum += price;
                        });
                        sum = (applicationSum * summaryObj.quantity) + summaryObj.price;
                        html += sum.toFixed(2);
                    } else {
                        html += summaryObj.price.toFixed(2)
                    }
                    //html += summaryObj.price.toFixed(2);
                }
                html += '</span>' +
                    '</div>';

                //navigation
                if (!summary.hasClass('second-step')) {
                    html += '<div class="navigation">' +
                        '<button class="cart">carrello</button>' +
                        '<button class="custom">personalizza</button>' +
                        '</div>';
                } else {
                    html += '<div class="navigation">' +
                        '<button class="back">indietro</button>' +
                        '<button class="addCustom">applicazione</button>' +
                        '<button class="cart">carrello</button>' +
                        '</div>';
                }
                //fine navigation
                html += '</div>'; //fine summary

                summary.append(html).show();
            } else {
                console.log('esiste');
            }
            return ADG;
        },
        updateSelected: function (object, key, value, ID) {
            var ADG = this;

            var keyToCheck = key,
                valueToCheck = value;
            if (!adg$.isEmptyObject(object)) {
                if (!adg$.isArray(object)) {
                    if (object.ID == ID) {
                        if (valueToCheck != '0') {
                            for (var key in object) {
                                if (key == keyToCheck) {
                                    if (object[key] != valueToCheck) {
                                        object[key] = valueToCheck
                                    }
                                }
                            }
                        }
                    }
                } else {
                    for (var i in object) {
                        if (object[i].ID == ID) {
                            object[i][key] = value;
                        }
                    }
                }
            }
            ADG.createSummary();
            return ADG;
        },
        updatePrice: function () {
            var ADG = this;
            var resume = adg$('#summary'),
                resumeApplication = resume.find('.single'),
                prezzo = resume.find('.price').data('price'),
                inputval = resume.find('input[name="shirtQuantity"]').val(),
                sum = inputval * prezzo;
            if (inputval > 0) {
                if (resumeApplication.length > 0) {
                    applicationSum = 0
                    adg$.each(resumeApplication, function () {
                        var price = +adg$(this).find('.single-price').html();
                        applicationSum += price;
                    });
                    sum = (applicationSum * inputval) + (inputval * prezzo);
                    resume.find('.price').text(sum.toFixed(2));
                } else {
                    resume.find('.price').text(sum.toFixed(2));
                    ADG.selectedProduct.partialPrice = sum;
                }
            } else {
                ADG.selectedProduct.partialPrice = prezzo;
            }
            return ADG;
        },
        updateQuantity: function () {
            var ADG = this;
            var resume = adg$('#summary'),
                quantita = resume.find('.quantity'),
                inputval = resume.find('input[name="shirtQuantity"]').val();

            quantita.text(inputval);
            inputval == "" ? ADG.selectedProduct.quantity = 1 : ADG.selectedProduct.quantity = inputval;
            return ADG;
        },
        addCustom: function () {
            var ADG = this,
                container = adg$('#materials .container');

            var newApplication = '<div class="single-application" id="' + ADG.selectedProduct.applicazioni.length + '">' +

                '<div class="single-application--title">' +
                'Aggiungi la tua applicazione' +
                '</div>' +
                '<div class="single-application--elements">' +

                '<div class="technics">' +
                '<select name="tecnichs" data-select="tecnica" class="application-select select-technics">' +
                '<option value="0">Seleziona la tecnica</option>';
            adg$.each(ADG.selectedProduct.technics, function (tecnica, value) {
                if (value == true) {
                    newApplication += '<option data-select="tecnica" value="' + tecnica + '">' + tecnica + '</option>';
                }
            });
            newApplication += ' </select>' +
                '</div>' +
                '<div class="style">' +
                '<select name="style" data-select="tipo" class="application-select select-style" disabled>' +
                '<option value="0">Seleziona lo stile</option>' +
                '</select>' +
                '</div>' +
                '<div class="color">' +
                '<select name="color" class="application-select select-color" data-select="colore" disabled>' +
                '<option value="0">Seleziona il colore</option>' +
                '</select>' +
                '</div>' +
                '<div class="position">' +
                '<select name="position" class="application-select select-position" data-select="posizione">' +
                '<option value="0">Seleziona la posizione</option>';
            adg$.each(ADG.selectedProduct.positions, function (position, value) {
                newApplication += '<option value="' + position + '">' + position + '</option>';
            });
            newApplication += ' </select>' +

                '<input class="dimension larghezza" placeholder="larghezza" type="number" min="0" max="0" name="larghezza" disabled>' +
                '<input class="dimension altezza" placeholder="altezza" type="number" min="0" max="0" name="altezza" disabled>' +
                '</div>' +
                '<div class="priceNavigation">' +
                '<div class="price with_currency">0</div>' +
                '<div class="navigation">' +
                '<button class="more">aggiungi</button>' +
                '<button class="remove" data-id="' + ADG.selectedProduct.applicazioni.length + '">rimuovi</button>' +
                '</div>' +
                '</div>' +
                //populate position
                '</div>' +
                '<div class="single-application--description">' +
                '</div>' +
                '</div>';
            container.append(newApplication);
            return ADG;
        },
        handleTechic: function (select) {
            var ADG = this,
                selectItem = select.parents('.single-application--elements').find('.select-style'),
                selectVal = select.val(),
                optionSelect = '<option value="0">Seleziona lo stile</option>';

            if (selectVal != '0') {
                adg$.each(ADG.tecniche[selectVal], function (i, val) {
                    optionSelect += '<option value="' + val.type + '" data-price="' + val.prezzo + '">' + val.type + '</option>';
                });
                selectItem.html('');
                adg$(optionSelect).appendTo(selectItem);
                selectItem.prop('disabled', false);
            }
            //seleziona direttamente lo stile se solo 1
            if (selectItem.find('option').length < 3) {
                selectItem.find('option').eq(1).prop('selected', 'selected').change();
            }
            return ADG;
        },
        populateColor: function (tecnica, select) {
            var ADG = this,
                selectColor = select.parents('.single-application--elements').find('.select-color'),
                selectStyle = select,
                styleVal = selectStyle.val(),
                optionSelect = '<option value="0">Seleziona il colore</option>';

            if (!selectStyle.is(':disabled') && selectStyle.val() != '0') {
                adg$.each(ADG.tecniche[tecnica], function (i, styleObj) {
                    if (styleVal === styleObj.type) {

                        if (styleObj.colore != undefined) {
                            if (styleObj.colore.length != '0') {
                                adg$.each(styleObj.colore, function (i, colore) {
                                    optionSelect += '<option value="' + colore + '">' + colore + '</option>';
                                });
                                selectColor.html('');
                                adg$(optionSelect).appendTo(selectColor);
                                selectColor.prop('disabled', false);
                            } else {
                                selectColor.html('');
                                adg$(optionSelect).appendTo(selectColor);
                                selectColor.prop('disabled', true);
                                ADG.showError('non ci sono colori disponibili, seleziona un altro materiale');
                            }
                        } else {
                            if (!selectColor.is(':disabled')) {
                                selectColor.html('');
                                adg$(optionSelect).appendTo(selectColor);
                                selectColor.prop('disabled', true);
                            }
                        }
                    }
                });
            }
            return ADG;
        },
        setDimenzionLimit: function (select) {
            var ADG = this,
                position = select.val(),
                selectedDimensions = ADG.selectedProduct.positions[position],
                altezza = select.parent().find('.altezza'),
                larghezza = select.parent().find('.larghezza');

            altezza.prop('disabled', false);
            larghezza.prop('disabled', false);

            larghezza.prop('max', selectedDimensions.larghezza);
            altezza.prop('max', selectedDimensions.altezza);
            return ADG;
        },
        checkDimension: function (input) {
            var ADG = this,
                inputVal = input.val(),
                inputMax = input.attr('max'),
                inputName = input.attr('name');
            emptyElement = input.parent().find('.dimension').filter(function () {
                return this.value == "";
            });
            if (+inputVal > +inputMax) {
                ADG.showError('Non puoi superare i ' + inputMax + 'cm di ' + inputName + '.');
                input.val(inputMax);
            }
            return ADG;
        },
        calculatePrice: function (element) {
            var ADG = this;
            var style = element.parents('.single-application--elements').find('.select-style option:selected'),
                altezza = +element.parents('.single-application--elements').find('.altezza').val(),
                larghezza = +element.parents('.single-application--elements').find('.larghezza').val(),
                priceContainer = element.parents('.single-application--elements').find('.price'),
                object = ADG.selectedProduct.applicazioni,
                ID = element.parents('.single-application').attr('id'),
                emptyElement = element.parents('.single-application--elements').find('.dimension').filter(function () {
                    return this.value == "";
                });

            if (emptyElement.length == 0) {
                //se sono definiti altezza e larghezza
                var price = 0;
                if (style.val() != 0) {
                    //se il valore della select non è 0
                    var price = style.data('price'),
                        priceToShow = price * (altezza * larghezza);

                } else {
                    var price = 0,
                        priceToShow = 0;
                }
                if (object.length > 0) {
                    //se ci sono applicazioni aggiorna
                    var value = priceToShow.toFixed(2);
                    priceContainer.text(value);
                    ADG.updateSelected(object, 'costo', value, ID);
                } else {
                    //se non c'è un'applicazione
                    priceContainer.text(priceToShow.toFixed(2));
                }

            }

            return ADG;
        },
        addApplication: function (btn) {
            var ADG = this,
                ID = btn.parents('.single-application').attr('id'),
                tecnica = btn.parents('.single-application--elements').find('.select-technics').val(),
                tipo = btn.parents('.single-application--elements').find('.select-style').val(),
                colore = btn.parents('.single-application--elements').find('.select-color').val(),
                posizione = btn.parents('.single-application--elements').find('.select-position').val(),
                altezza = btn.parents('.single-application--elements').find('.altezza').val(),
                larghezza = btn.parents('.single-application--elements').find('.larghezza').val(),
                costo = +btn.parents('.single-application--elements').find('.price').html(),
                applicationArray = ADG.selectedProduct.applicazioni,
                emptyElement = btn.parents('.single-application--elements').find('.dimension').filter(function () {
                    return this.value == "";
                });

            applicazione = {};

            applicazione.ID = ID;
            applicazione.tecnica = tecnica;
            applicazione.tipo = tipo;
            applicazione.colore = colore;
            applicazione.posizione = posizione;
            applicazione.altezza = altezza;
            applicazione.larghezza = larghezza;
            applicazione.costo = costo.toFixed(2);

            if (emptyElement.length == 0) {
                applicationArray.push(applicazione);
                ADG.addCustom();
            } else {
                ADG.showError('Devi compilare altezza e larghezza');
            }

            return ADG;
        },
        //TODO updateApplication con seconda applicazione
        updateApplication: function (select) {
            var ADG = this;
            var ID = select.parents('.single-application').attr('id'),
                object = ADG.selectedProduct.applicazioni,
                selectTocheck = select.parents('.single-application').find('.application-select');
            if (object.length > 0) {
                for (var i in object) {
                    if (object[i].ID == ID) {
                        selectTocheck.each(function () {
                            var key = adg$(this).data('select'),
                                value = adg$(this).val();
                            ADG.updateSelected(object, key, value, ID);
                        })
                        ADG.calculatePrice(select);
                        var value = select.parents('.single-application').find('.price').text();
                        ADG.updateSelected(object, 'costo', value, ID);
                    }
                }
            }
            return ADG;
        },
        removeApplication: function (btn) {
            var ADG = this;
            var applications = ADG.selectedProduct.applicazioni,
                id = btn.data('id');
            var result = adg$.grep(applications, function (e) {
                return e.ID == id;
            });
            var toRemove = applications.indexOf(result);
            applications.splice(toRemove, 1);

            if (btn.hasClass('resume')) {
                btn.parent().remove();
                adg$('#materials').find('#' + id).remove();
            } else {
                btn.parents('.single-application').remove();
                adg$('#summary').find('#' + id).remove();
            }
            return ADG;
        },
        checkout: function () {
            var ADG = this;
            var cartObj = ADG.selectedProduct,
                cart = adg$('#materials .container'),
                html =
                '<div class="summary-content" data-selected="' + cartObj.ID + '">' + //summary content
                '<div class="nomelavorazione">Nome Lavorazione</div>' +
                '<div class="product">' +
                '<div class="selectedImage">' + //immagine
                '<img src="' + cartObj.image + '">' +
                '</div>' + //fine immagine
                '<div class="product-info">' + //product info
                '<div class="title">' + cartObj.modello + '</div>' +
                '<div class="brand">' + cartObj.brand + '</div>' +
                '<div class="selectedQuantity">' + //quantità
                '<span class="multiplier">x</span>' +
                '<span class="quantity">' + cartObj.quantity + '</span>' +
                '</div>' + //fine quantità
                '<div class="selectedcolor">';
            cartObj.color != undefined ? html += '<div class="color">' + cartObj.color + '</div></div>' : html += '</div>';

            html += '<div class="selectedsize">';
            cartObj.size != 'undefined' ? html += '<div class="size">' + cartObj.size + '</div></div>' : html += '</div>';
            html += '</div>' + //fine product info
                '</div>'; //fine product
            if (cartObj.applicazioni.length > 0) {
                html += '<div class="application">' +
                    '<div class="application-container">';

                adg$.each(cartObj.applicazioni, function (a, b) {
                    html += '<div class="single" id="' + b.ID + '">' +
                        '<div class="single-details">' +
                        '<div class="single-tecnica">';
                    b.tecnica != '0' ? html += '<div class="type">' + b.tecnica + '</div>' : html += '<div class="type"></div>';
                    b.tipo != '0' ? html += '<div class="style">' + b.tipo + '</div>' : html += '<div class="style"></div>';
                    b.colore != '0' ? html += '<div class="color">' + b.colore + '</div>' : html += '<div class="color"></div>';
                    html += '</div>' +
                        '<div class="single-posizione">' +
                        '<div class="position">' + b.posizione + '</div>' +
                        '<div class="width">' + b.larghezza + '</div>' +
                        '<div class="ics">x</div>' +
                        '<div class="height">' + b.altezza + '</div>' +
                        '</div>' +

                        '</div>' +

                        '<div class="single-price">' + b.costo + '</div>' +
                        '<div class="remove resume" data-id="' + b.ID + '">x</div>' +
                        '</div>';
                })

                html += '</div>' +
                    '</div>';
            } else {
                html += '<div></div>';
            }
            // price
            html += '<div class="selectedPrice">' +
                '<span class="price with_currency" data-price="' + cartObj.price + '">Prezzo totale' + cartObj.totalPrice + '</span>' +
                '</div>';

            //navigation
            html += '<div class="navigation">' +
                '<button class="new">nuova</button>' +
                '<button class="send">invia</button>' +
                '</div>';
            //fine navigation
            html += '</div>'; //fine summary

            cart.append(html).show();


            return ADG;
        },
        showError: function (message, value) {
            var ADG = this;
            adg$.magnificPopup.open({
                items: {
                    src: '<div class="white-popup">' + message + '</div>',
                    type: 'inline'
                }
            });
            return ADG;
        }

    };

    adg$(document).ready(function () {
        ADG.init();
    });

})(jQuery);