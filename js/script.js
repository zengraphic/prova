(function (adg$) {



    var ADG = {
        lavorazioni: {},
        prodotti: {},
        tecniche: {},

        init: function () {
            ADG.recoverData('prodotti');
            ADG.bindActions();
        },
        AjaxCall: function (dataType) {
            return adg$.ajax({
                type: "GET",
                url: 'js/json/' + dataType + '.json',
                dataType: 'json',
                async: false
            });
        },
        getData: function (dataType) {
            var ADG = this;
            var getData = new adg$.Deferred();

            var AjaxCallPromise = getData
                .then(function () {
                    return ADG.AjaxCall(dataType);
                })
                .done(function (data) { })
                .fail(function () { });

            var interpolateDataPromise = AjaxCallPromise
                .then(function (data) {
                    return ADG.saveProducts(data, dataType);
                })
                .done(function () { })
                .fail(function () { });

            getData
                .resolve();

            return getData.promise();
        },
        recoverData: function (dataType) {
            var ADG = this,
                recoverData = new adg$.Deferred(),
                recoverProductsData = recoverData
                    .then(function () {
                        if (dataType == 'prodotti') {
                            return ADG.getData('prodotti');
                        } else {
                            ADG.getData('tecniche');
                        }
                    })
                    .done(function () { }).fail(function () { });
            recoverData
                .resolve();
            return recoverData.promise();
        },
        saveProducts: function (data, dataType) {
            var ADG = this,
                productsBtn = [],
                productsArray = data,
                container = adg$('#prodotti__container');
            adg$.each(productsArray, function (index, prodotti) {
                productsBtn.push('<li><a href="javascript:void(0)" id="' + index + '" class="product_btn">' + index + '</a></li>');
                ADG.prodotti[index] = prodotti;

            });
            adg$('<ul/>', {
                'class': 'product-list',
                html: productsBtn.join('')
            }).appendTo(container);
        },
        bindActions: function () {
            var ADG = this;
            adg$('body')
                .on({
                    'click': function () {
                        var product = adg$(this).attr('id');
                        ADG.showProducts(product);

                        btn = adg$(this);
                        //ADG.updateSummary(btn);
                    }
                }, '.product_btn');
            adg$('body')
                .on({
                    'change': function (e) {
                        e.preventDefault();
                        ADG.updateSummary(adg$(this).data('select'), adg$(this).val());

                        ADG.createSummary();
                    }
                }, '.select_colore');
            adg$('body')
                .on({
                    'change': function (e) {
                        e.preventDefault();
                        if (!adg$.isEmptyObject(ADG.lavorazioni)) {
                            ADG.updateSummary(adg$(this).data('select'), adg$(this).val());
                            ADG.createSummary();
                        }
                    }
                }, '.select_taglia');
            // adg$('body')
            //     .on({
            //         'click': function () {
            //             var product = adg$(this).attr('id');
            //             ADG.showTechnics(product);
            //         }
            //     }, '.technic_btn');
            adg$('body')
                .on({
                    'click': function (e) {
                        e.preventDefault();
                        var btn = adg$(this);
                        ADG.updateList(btn);
                    }
                }, '.product-btn');
            adg$('body')
                .on({
                    'keyup': function () {
                        ADG.updatePrice();
                        ADG.updateQuantity();

                    },
                    'change': function () {
                        ADG.updatePrice();
                        ADG.updateQuantity();

                    }
                }, 'input[name="shirtQuantity"]');
            adg$('body')
                .on({
                    'click': function (e) {
                        e.preventDefault();
                        //ADG.saveLavorazione();
                        if (adg$('#summary').hasClass('2step')) {

                            adg$('#prodotti__container').html('');
                            ADG.showSummary();
                        } else {
                            var quantity = +adg$('.selectedQuantity .quantity').html();
                            var partialPrice = +adg$('.selectedPrice .price').text();
                            adg$('#materials .container').html('');
                            adg$('#prodotti__container').html('');
                            ADG.updateSummary('quantity', quantity);
                            ADG.updateSummary('partialPrice', partialPrice);
                            adg$('.selectQuantity').hide();
                            adg$('#summary').addClass('2step');
                        }
                    }
                }, '.navigation button');
            adg$('body')
                .on({
                    'change': function () {
                        ADG.handleTechnicChange();
                        ADG.resetInputDimensions();
                        adg$('.select_position_technic').val('seleziona posizione').trigger('change')
                    }
                }, '.radio__adg');
            adg$('body')
                .on({
                    'change': function () {

                        ADG.resetInputDimensions();
                        ADG.activateInputDimensions();
                    }
                }, '.select_position_technic');
            adg$('body')
                .on({
                    'blur': function () {

                        ADG.updateTechnicPrice();

                    }
                }, '.input-dimensioni');
            adg$('body')
                .on({
                    'click': function (e) {
                        e.preventDefault();
                        ADG.addApplication(adg$(this));
                        ADG.createSummary();
                    }
                }, '.technic-btn');
        },
        showProducts: function (product) {
            var ADG = this,
                products = product,
                productObj = ADG.prodotti[products],
                html = '',
                container = adg$('#materials .container');

            container.html('');
            adg$.each(productObj, function (index, el) {

                html += '<div class="product-single" id="' + el.id + '" data-prezzo="' + el.prezzo + '" data-brand="' + el.brand + '"  data-modello="' + el.modello + '" data-type="' + product + '" data-index="' + index + '" >' +
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
                    html += '<select class="select_colore" data-select="color">';
                    adg$.each(el.colore, function (i, colore) {
                        html += '<option value="' + colore + '">' + colore + '</option>';
                    });
                    html += '</select>';
                }
                if (el.taglia.length > 0) {
                    html += '<select class="select_taglia" data-select="size">';
                    adg$.each(el.taglia, function (i, taglia) {
                        html += '<option value="' + taglia + '">' + taglia + '</option>';
                    });
                    html += '</select>';
                }
                html += '</div>' + //chiusura select
                    '<div class="product-prezzo with_currency">' + el.prezzo.toFixed(2) + '</div>' +
                    '<a href="" class="product-btn">scegli</a>' +
                    '</div>'; //chiusura single
            });

            container.append(html);
            return ADG;
        },
        saveSelectedProduct: function (btn) {
            var ADG = this;
            var selected = btn.parent(),
                selectedType = selected.data('type'),
                selectedindex = selected.data('index'),
                selectedId = selected.data('id'),
                selectedBrand = selected.data('brand'),
                selectedModello = selected.data('modello'),
                selectedPrice = selected.data('prezzo'),
                selectedPositions = ADG.prodotti[selectedType][selectedindex].stampa[0],
                //recueriamo i dettagli
                selectedImage = selected.find('img').attr('src'),
                selectedMateriale = selected.find('.product-materiale').html(),
                selectedGrammatura = selected.find('.product-grammatura').html(),
                selectedgender = selected.find('.product-gender').html(),

                selectedColor = selected.find('.select_colore :selected').val(),
                selectedSize = selected.find('.select_taglia :selected').val(),

                selectedProduct = {},
                selectedArray = [];

            selectedProduct.type = selectedType;
            selectedProduct.modello = selectedModello;
            selectedProduct.brand = selectedBrand;
            selectedProduct.image = selectedImage;
            selectedProduct.price = selectedPrice;
            selectedProduct.positions = selectedPositions;

            selectedProduct.color = selectedColor;
            selectedProduct.size = selectedSize;
            selectedProduct.materiale = selectedMateriale;
            selectedProduct.grammatura = selectedGrammatura;
            selectedProduct.gender = selectedgender;
            selectedProduct.quantity = '';
            selectedProduct.partialPrice = '';
            selectedProduct.applicazioni = [];
            selectedProduct.totalPrice = '';

            selectedArray.push(selectedProduct);
            adg$.each(selectedArray, function (index, el) {
                ADG.lavorazioni[index] = el;
            });
            console.log(ADG.lavorazioni);

            return ADG;
        },
        showTechnics: function (product) {
            var ADG = this,
                technics = product,
                productObj = ADG.tecniche[technics],
                selectedProductPositions = ADG.lavorazioni[0].positions;
            html = '',
                container = adg$('#materials .container');
            container.html('');

            adg$.each(productObj, function (index, el) {

                html += '<div class="technic-single" id="' + el.id + '" data-prezzos="' + el.prezzoS + '" data-prezzom="' + el.prezzoM + '" data-prezzob="' + el.prezzoB + '" data-modello="' + technics + '">' +
                    '<div class="technic-top">' +
                    '<div class="technic-radio"><input type="radio" name="radio_type" value="' + el.type + '" class="radio__adg"></div>' +
                    '<div class="technic-name">' + el.type + '</div>' +
                    '<div class="technic-description">' + el.description + '</div>' +
                    '<div class="technic-prezzo "><div class="price with_currency">da ' + el.prezzoS.toFixed(2) + '</div></div>' +
                    '</div>' + //chiusura top
                    '<div class="technic-bottom">' +
                    '<div class="technic-bottom__content">' +
                    '<div class="technic-select-colore">';
                if (el.colore.length > 0) {
                    html += '<select class="select_colore_technic">';
                    adg$.each(el.colore, function (i, colore) {
                        html += '<option value="' + colore + '">' + colore + '</option>';
                    });
                    html += '</select>';
                }
                html += '</div>' + //chiusura select
                    '<div class="technic-select-posizione">' +
                    '<select class="select_position_technic">' +
                    '<option>seleziona posizione</option>';

                adg$.each(selectedProductPositions, function (posizione, array) {
                    html += '<option value="' + posizione + '">' + posizione + '</option>';
                });
                html += '</select>' +
                    '</div>' +
                    '<div class="technic-dimension-input">' +
                    '<input class="input-dimensioni" type="number" name="larghezza" min="0" max="0" disabled="disabled">' +
                    '<input class="input-dimensioni" type="number" name="altezza" min="0" max="0" disabled="disabled">' +
                    '<div class="details">Larghezza massima:<span class="details-larghezza"></span></div>' +
                    '<div class="details">Alezza massima:<span class="details-altezza"></span></div>' +
                    '</div>' + //chiusura input
                    '<div class="technic-applicationPrice"><div class="price with_currency"></div></div>' +
                    '<div class="technic-buttons">' +
                    '<button  type="button" disabled class="technic-btn">aggiungi</button>' +
                    '</div>' + //chiusura buttons
                    '</div>' +
                    '</div>' + //chiusura bottom
                    '</div>'; //chiusura single
            });


            container.append(html);
            return ADG;
        },
        createSummary: function () {
            var ADG = this;
            var summaryObj = ADG.lavorazioni,
                summary = adg$('#summary'),
                container = adg$('#summary .summary_content');
            html = '';
            container.html('');
            if (summary.hasClass('2step')) {
                adg$.each(summaryObj, function (index, el) {

                    html += '<div class="selectedImage">' +
                        '<img src="' + el.image + '">' +
                        '</div>' +
                        '<div class="selectedPrice">' +
                        '<span class="title">' + el.modello + '</span>' +
                        '<span class="price with_currency" data-price="' + el.price + '">' + el.totalPrice.toFixed(2) + '</span>' +
                        '</div>' +
                        '<div class="selectedQuantity">' +
                        '<div class="color">' + el.color + '</div>' +
                        '<div class="size">' + el.size + '</div>' +
                        '<span class="multiplier">x</span>' +
                        '<span class="quantity">' + el.quantity + '</span>' +
                        '</div>' +
                        '<div class="selectedTechnic">' +
                        '<div class="type">' + el.applicazioni[0].tecnica + ' ' + el.applicazioni[0].materiale + '</div>' +
                        '<div class="color">' + el.applicazioni[0].colore + '</div>' +
                        '<div class="dimensions">' + el.applicazioni[0].larghezza + 'x' + el.applicazioni[0].altezza + '</div>' +
                        ' </div>' +
                        '<div class="navigation">' +
                        '<button>Ciao</button>' +
                        '</div>';
                });
            } else {
                adg$.each(summaryObj, function (index, el) {

                    html += '<div class="selectedImage">' +
                        '<img src="' + el.image + '">' +
                        '</div>' +
                        '<div class="selectedPrice">' +
                        '<span class="title">' + el.modello + '</span>' +
                        '<span class="price with_currency" data-price="' + el.price + '">' + el.price.toFixed(2) + '</span>' +
                        '</div>' +
                        '<div class="selectedQuantity">' +
                        '<div class="color">' + el.color + '</div>' +
                        '<div class="size">' + el.size + '</div>' +
                        '<span class="multiplier">x</span>' +
                        '<span class="quantity">1</span>' +
                        '</div>' +
                        '<div class="selectQuantity">' +
                        '<div class="text">Seleziona la qunatità:</div>' +
                        '<input type="number" name="shirtQuantity" min="1">' +
                        '</div>' +
                        '<div class="selectedTechnic">' +
                        '<div class="type"></div>' +
                        '<div class="color"></div>' +
                        '<div class="dimensions"></div>' +
                        ' </div>' +
                        '<div class="navigation">' +
                        '<button>Ciao</button>' +
                        '</div>';
                });
            }
            container.append(html);
            summary.show();
            return ADG;
        },
        updateList: function (btn) {
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
                ADG.saveSelectedProduct(btn);
                ADG.createSummary(btn);
            }
            return ADG;
        },
        updatePrice: function () {
            var ADG = this;
            var resume = adg$('#summary'),
                prezzo = resume.find('.price').data('price'),
                inputval = resume.find('input[name="shirtQuantity"]').val(),
                sum = inputval * prezzo;
            if (inputval > 0) {
                resume.find('.price').text(sum.toFixed(2));
            }
            return ADG;
        },
        updateQuantity: function () {
            var ADG = this;
            var resume = adg$('#summary'),
                quantita = resume.find('.quantity'),
                inputval = resume.find('input[name="shirtQuantity"]').val();

            quantita.text(inputval);
            return ADG;
        },
        updateSummary: function (key, value) {
            var ADG = this;

            var object = ADG.lavorazioni[0],
                keyToCheck = key,
                valueToCheck = value;

            for (var key in object) {
                if (key == keyToCheck) {
                    if (object[key] != valueToCheck) {
                        object[key] = valueToCheck
                    }
                }
            }
            console.log(object);
            return ADG;
        },
        handleTechnicChange: function () {
            var ADG = this;
            var selectedTechnicContainer = adg$('#materials').find('.technic-single');
            var selectedTechnic = selectedTechnicContainer.find('.radio__adg:checked');
            var selectedBottom = selectedTechnic.parents('.technic-top').next('.technic-bottom');
            var otherMethods = adg$('#materials').find('.technic-bottom').not(selectedTechnic);
            if (!selectedBottom.hasClass('active')) {
                otherMethods
                    .each(function () {
                        var currentCycledMethod = adg$(this);
                        var isActiveMethod = currentCycledMethod.hasClass('active');
                        if (isActiveMethod) {
                            ADG
                                .closeTechnic(currentCycledMethod);
                        }
                    });


                ADG
                    .openTechnic(selectedBottom);
            } else {
                ADG.closeTechnic(currentCycledMethod);
            }

            return ADG;
        },
        openTechnic: function (selectedBottom) {
            var $TOPUP = this;
            selectedBottom
                .addClass('active');
            selectedBottom.slideDown("slow");

            return ADG;
        },
        closeTechnic: function (selectedBottom) {
            var ADG = this;
            selectedBottom
                .removeClass('active');
            selectedBottom.slideUp("slow");

            return ADG;
        },
        activateInputDimensions: function () {
            var ADG = this;
            var tecnica = adg$('.technic-bottom.active').find('.select_position_technic :selected').val();
            if (tecnica != "seleziona posizione") {
                altezza = ADG.lavorazioni[0].positions[tecnica].altezza,
                    larghezza = ADG.lavorazioni[0].positions[tecnica].larghezza;
            }
            if (tecnica == "seleziona posizione") {
                adg$('.technic-dimension-input input').prop('disabled', true);
                adg$('.details-altezza').html('0cm');
                adg$('.details-larghezza').html('0cm');
            } else {
                adg$('.technic-dimension-input input').prop('disabled', false);
                adg$('.technic-dimension-input input[name="larghezza"]').prop('max', larghezza);
                adg$('.technic-dimension-input input[name="altezza"]').prop('max', altezza);
                adg$('.details-altezza').html(altezza + 'cm');
                adg$('.details-larghezza').html(larghezza + 'cm');
            }

            return ADG;
        },
        resetInputDimensions: function () {
            var ADG = this;
            adg$('.technic-dimension-input input').val('');
            adg$('.technic-btn').prop('disabled', true);
            adg$('.technic-applicationPrice .price').html('');

            return ADG;
        },
        updateTechnicPrice: function () {
            var ADG = this;
            var radio = adg$('.radio__adg:checked'),
                tecnica = radio.val(),
                active = radio.parents('.technic-single'),
                prezzo = active.find('.technic-applicationPrice .price'),
                larghezza = active.find('.technic-dimension-input input[name="larghezza"]').val(),
                altezza = active.find('.technic-dimension-input input[name="altezza"]').val();
            var price;

            if (larghezza != 0 && altezza != 0) {
                var printArea = larghezza * altezza;

                if (printArea <= 50) {
                    price = active.data('prezzos');
                } else if (printArea <= 200) {
                    price = active.data('prezzom');
                } else {
                    price = active.data('prezzob');
                }
                var totalPrice = (price.toFixed(2) * ADG.lavorazioni[0].quantity) + ADG.lavorazioni[0].price;
                prezzo.html(price.toFixed(2));
                adg$('.technic-btn').prop('disabled', false);
            }



            return ADG;
        },
        addApplication: function (btn) {
            var ADG = this;
            var applicationPrice = btn.parents('.technic-bottom__content').find('.technic-applicationPrice .price').html();
            var objApplicazione = ADG.lavorazioni[0].applicazioni;
            var applicazione = {};

            applicazione.tecnica = btn.parents('.technic-single').data('modello');
            applicazione.materiale = btn.parents('.technic-single').find('.radio__adg').val();
            applicazione.colore = btn.parents('.technic-bottom__content').find('.select_colore_technic :selected').val();
            applicazione.posizione = btn.parents('.technic-bottom__content').find('.select_position_technic :selected').val();
            applicazione.larghezza = btn.parents('.technic-bottom__content').find('.input-dimensioni[name="larghezza"]').val();
            applicazione.altezza = btn.parents('.technic-bottom__content').find('.input-dimensioni[name="altezza"]').val();
            applicazione.price = applicationPrice;
            ADG.lavorazioni[0].totalPrice = (applicationPrice * ADG.lavorazioni[0].quantity) + ADG.lavorazioni[0].partialPrice;
            objApplicazione.push(applicazione);
            console.log(ADG.lavorazioni[0]);
            return ADG;
        },
        showSummary: function () {
            var ADG = this,

                summary = ADG.lavorazioni,
                html = '',
                container = adg$('#materials .container');
            console.log(ADG.lavorazioni);
            container.html('');
            adg$.each(summary, function (index, el) {

                console.log(index);
                html += '<div class="resume-top">' +
                    '<div class="img-container">' +
                    '<img src="' + el.image + '">' +
                    '</div>' +
                    '<div class="resume-product-details">' +
                    '<h1>' + el.modello + '</h1>' +
                    '<span class="type">' + el.type + '</span>' +
                    '<span class="brand">' + el.brand + '</span>' +
                    '</div>' +
                    '</div>' +
                    '<div>' + el.color + '</div>' +
                    '<div>' + el.materiale + '</div>' +
                    '<div>' + el.grammatura + '</div>' +
                    '<div>' + el.gender + '</div>' +
                    '<div>' + el.size + '</div>' +
                    '<div>' + el.price + '</div>' +
                    '<div>' + el.quantity + '</div>' +
                    '<div>' + el.partialPrice + '</div>' +
                    '<div>' + el.applicazioni[0].tecnica + '</div>' +
                    '<div>' + el.applicazioni[0].materiale + '</div>' +
                    '<div>' + el.applicazioni[0].colore + '</div>' +
                    '<div>' + el.applicazioni[0].tecnica + '</div>' +
                    '<div>' + el.applicazioni[0].posizione + '</div>' +
                    '<div>' + el.applicazioni[0].larghezza + '</div>' +
                    '<div>' + el.applicazioni[0].altezza + '</div>' +
                    '<div>' + el.applicazioni[0].price + '</div>' +

                    '<div>' + el.totalPrice + '</div>';
            });

            container.append(html);
            return ADG;
        }
    };
    adg$(document).ready(function () {
        ADG.init();
    });
})(jQuery);
